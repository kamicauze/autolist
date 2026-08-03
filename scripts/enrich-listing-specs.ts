/**
 * Enrich remaining missing spec columns on ACTIVE listings with realistic
 * model-inferred values (Kenya market norms). Seed/demo data only.
 *
 * - Only fills NULL/missing values; never overwrites non-null values (idempotent).
 * - Skips motorbike / farm / plant rows (non-"car" categories and any row whose
 *   metadata marks it as a bike or equipment).
 * - Mileage is derived deterministically from the listing id (stable re-runs).
 * - Filled values are mirrored into metadata.details (fuelType, transmission,
 *   mileage, engineCapacity) so display fallbacks agree.
 *
 * Usage: npx tsx scripts/enrich-listing-specs.ts [--dry-run]
 */
import fs from "fs";
import path from "path";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadEnv();

import { createAdminClient } from "../lib/supabase/admin";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type ListingRow = {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  category: string | null;
  fuel_type: string | null;
  transmission: string | null;
  mileage: number | null;
  seats: number | null;
  doors: number | null;
  drive_type: string | null;
  body_type: string | null;
  metadata: Record<string, Json> | null;
};

const SPEC_COLUMNS = ["fuel_type", "transmission", "mileage", "seats", "doors", "drive_type", "body_type"] as const;

const dryRun = process.argv.includes("--dry-run");

type Spec = {
  fuel?: string;
  trans?: string;
  cc?: number;
  body?: string;
  seats?: number;
  doors?: number;
  drive?: string;
};

/** Model rules, first match wins. Matched against `${make} ${model}` lowercased. */
const MODEL_RULES: Array<[RegExp, Spec]> = [
  // Toyota
  [/land\s*cruiser\s*prado|(^|\s)prado\b/, { fuel: "diesel", trans: "automatic", cc: 2800, body: "suv", seats: 7, doors: 5, drive: "4wd" }],
  [/land\s*cruiser/, { fuel: "diesel", trans: "automatic", cc: 4500, body: "suv", seats: 7, doors: 5, drive: "4wd" }],
  [/corolla\s*fielder|fielder/, { fuel: "petrol", trans: "automatic", cc: 1500, body: "hatchback", seats: 5, doors: 5, drive: "fwd" }],
  [/corolla/, { fuel: "petrol", trans: "automatic", cc: 1500, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  [/probox/, { fuel: "petrol", trans: "automatic", cc: 1300, body: "wagon", seats: 5, doors: 5, drive: "fwd" }],
  [/alphard/, { fuel: "petrol", trans: "automatic", cc: 2500, body: "van", seats: 7, doors: 5, drive: "fwd" }],
  [/camry/, { fuel: "petrol", trans: "automatic", cc: 2500, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  [/crown/, { fuel: "petrol", trans: "automatic", cc: 2500, body: "sedan", seats: 5, doors: 4, drive: "rwd" }],
  // Mazda
  [/cx-?9/, { fuel: "petrol", trans: "automatic", cc: 2500, body: "suv", seats: 7, doors: 5, drive: "awd" }],
  [/cx-?8/, { fuel: "diesel", trans: "automatic", cc: 2200, body: "suv", seats: 7, doors: 5, drive: "awd" }],
  [/cx-?5/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "suv", seats: 5, doors: 5, drive: "awd" }],
  [/demio/, { fuel: "petrol", trans: "automatic", cc: 1300, body: "hatchback", seats: 5, doors: 5, drive: "fwd" }],
  [/axela/, { fuel: "petrol", trans: "automatic", cc: 1500, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  [/atenza/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  // Subaru
  [/forester/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "suv", seats: 5, doors: 5, drive: "awd" }],
  [/wrx/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "sedan", seats: 5, doors: 4, drive: "awd" }],
  // Nissan
  [/x-?trail/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "suv", seats: 5, doors: 5, drive: "awd" }],
  // Honda
  [/honda\s+fit/, { fuel: "petrol", trans: "automatic", cc: 1300, body: "hatchback", seats: 5, doors: 5, drive: "fwd" }],
  [/insight/, { fuel: "hybrid", trans: "automatic", cc: 1500, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  // Mercedes
  [/\bgle\b/, { fuel: "petrol", trans: "automatic", cc: 3000, body: "suv", seats: 5, doors: 5, drive: "awd" }],
  [/s\s*class|s350/, { fuel: "petrol", trans: "automatic", cc: 3500, body: "sedan", seats: 5, doors: 4, drive: "rwd" }],
  [/e\s*class|e200|e250/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "sedan", seats: 5, doors: 4, drive: "rwd" }],
  [/c\s*class|c200|c180/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "sedan", seats: 5, doors: 4, drive: "rwd" }],
  // BMW
  [/bmw\s+x1/, { fuel: "petrol", trans: "automatic", cc: 1500, body: "suv", seats: 5, doors: 5, drive: "fwd" }],
  [/bmw\s+x2/, { fuel: "petrol", trans: "automatic", cc: 1500, body: "suv", seats: 5, doors: 5, drive: "fwd" }],
  [/bmw\s+x3/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "suv", seats: 5, doors: 5, drive: "awd" }],
  // VW / Audi / Peugeot / Volvo
  [/passat/, { fuel: "petrol", trans: "automatic", cc: 1800, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  [/polo/, { fuel: "petrol", trans: "automatic", cc: 1200, body: "hatchback", seats: 5, doors: 5, drive: "fwd" }],
  [/audi\s+a3/, { fuel: "petrol", trans: "automatic", cc: 1400, body: "hatchback", seats: 5, doors: 5, drive: "fwd" }],
  [/audi\s+a5/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "coupe", seats: 4, doors: 2, drive: "fwd" }],
  [/peugeot\s+3008/, { fuel: "petrol", trans: "automatic", cc: 1600, body: "suv", seats: 5, doors: 5, drive: "fwd" }],
  [/peugeot\s+208/, { fuel: "petrol", trans: "automatic", cc: 1200, body: "hatchback", seats: 5, doors: 5, drive: "fwd" }],
  [/volvo\s+s60/, { fuel: "petrol", trans: "automatic", cc: 1600, body: "sedan", seats: 5, doors: 4, drive: "fwd" }],
  [/xc90/, { fuel: "petrol", trans: "automatic", cc: 2000, body: "suv", seats: 7, doors: 5, drive: "awd" }],
  // Others
  [/pajero/, { fuel: "diesel", trans: "automatic", cc: 3200, body: "suv", seats: 7, doors: 5, drive: "4wd" }],
  [/grand\s*cherokee/, { fuel: "petrol", trans: "automatic", cc: 3600, body: "suv", seats: 5, doors: 5, drive: "4wd" }],
  [/lexus\s+rx/, { fuel: "petrol", trans: "automatic", cc: 2700, body: "suv", seats: 5, doors: 5, drive: "fwd" }],
  [/bentayga/, { fuel: "petrol", trans: "automatic", cc: 4000, body: "suv", seats: 5, doors: 5, drive: "awd" }],
];

/** Body-type based fallback when no model rule matches. */
const BODY_FALLBACK: Record<string, Spec> = {
  suv: { seats: 5, doors: 5, drive: "awd" },
  sedan: { seats: 5, doors: 4, drive: "fwd" },
  saloon: { seats: 5, doors: 4, drive: "fwd" },
  hatchback: { seats: 5, doors: 5, drive: "fwd" },
  wagon: { seats: 5, doors: 5, drive: "fwd" },
  coupe: { seats: 4, doors: 2, drive: "rwd" },
  van: { seats: 7, doors: 5, drive: "fwd" },
  pickup: { seats: 5, doors: 4, drive: "4wd" },
};

function detailsOf(listing: ListingRow): Record<string, Json> {
  return ((listing.metadata?.details as Record<string, Json> | undefined) ?? {}) as Record<string, Json>;
}

function isNonCar(listing: ListingRow): boolean {
  if (listing.category !== "car") return true;
  const details = detailsOf(listing);
  return details.bikeType !== undefined || details.equipmentType !== undefined;
}

function inferSpec(listing: ListingRow): Spec {
  const key = `${listing.make ?? ""} ${listing.model ?? ""}`.toLowerCase();
  let spec: Spec = {};
  for (const [pattern, rule] of MODEL_RULES) {
    if (pattern.test(key)) {
      spec = { ...rule };
      break;
    }
  }
  // Existing body type (column or metadata) refines fallback fields.
  const existingBody =
    listing.body_type ??
    (typeof detailsOf(listing).bodyType === "string" ? String(detailsOf(listing).bodyType).toLowerCase() : null) ??
    spec.body ??
    null;
  const fallback = existingBody ? (BODY_FALLBACK[existingBody] ?? {}) : {};
  return {
    fuel: spec.fuel ?? "petrol",
    trans: spec.trans ?? "automatic",
    cc: spec.cc,
    body: spec.body ?? existingBody ?? undefined,
    seats: spec.seats ?? fallback.seats ?? 5,
    doors: spec.doors ?? fallback.doors ?? 4,
    drive: spec.drive ?? fallback.drive ?? "fwd",
  };
}

/** Deterministic 0..1 value derived from the listing id (stable across runs). */
function hashFraction(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function inferMileage(listing: ListingRow): number {
  const currentYear = new Date().getFullYear();
  const year = listing.year ?? currentYear - 8;
  const fraction = hashFraction(listing.id);
  if (year >= 2025) {
    // New / nearly-new: under 5,000 km.
    return 500 + Math.round(fraction * 4000);
  }
  const age = Math.max(1, currentYear - year);
  const perYear = 10000 + fraction * 5000; // 10,000–15,000 km per year
  return Math.round((age * perYear) / 100) * 100;
}

async function main() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, make, model, year, category, fuel_type, transmission, mileage, seats, doors, drive_type, body_type, metadata")
    .eq("status", "active");
  if (error) throw error;

  const listings = (data ?? []) as ListingRow[];
  const hasEngineCapacity = (listing: ListingRow) => {
    const top = listing.metadata?.engineCapacity;
    const nested = detailsOf(listing).engineCapacity;
    return (top !== null && top !== undefined && String(top).trim() !== "") ||
      (nested !== null && nested !== undefined && String(nested).trim() !== "");
  };

  const before: Record<string, number> = {};
  const after: Record<string, number> = {};
  for (const column of SPEC_COLUMNS) {
    before[column] = listings.filter((listing) => listing[column] !== null).length;
    after[column] = before[column];
  }
  before.engineCapacity = listings.filter(hasEngineCapacity).length;
  after.engineCapacity = before.engineCapacity;

  let updatedRows = 0;
  let skippedNonCar = 0;
  for (const listing of listings) {
    if (isNonCar(listing)) {
      skippedNonCar += 1;
      continue;
    }

    const spec = inferSpec(listing);
    const patch: Record<string, Json> = {};
    const detailsPatch: Record<string, Json> = {};

    if (listing.fuel_type === null && spec.fuel) {
      patch.fuel_type = spec.fuel;
      detailsPatch.fuelType = spec.fuel;
    }
    if (listing.transmission === null && spec.trans) {
      patch.transmission = spec.trans;
      detailsPatch.transmission = spec.trans;
    }
    if (listing.mileage === null) {
      const mileage = inferMileage(listing);
      patch.mileage = mileage;
      detailsPatch.mileage = String(mileage);
    }
    if (listing.seats === null && spec.seats !== undefined) patch.seats = spec.seats;
    if (listing.doors === null && spec.doors !== undefined) patch.doors = spec.doors;
    if (listing.drive_type === null && spec.drive) patch.drive_type = spec.drive;
    if (listing.body_type === null && spec.body) patch.body_type = spec.body;

    let engineCapacityAdded = false;
    if (!hasEngineCapacity(listing) && spec.cc !== undefined) {
      detailsPatch.engineCapacity = String(spec.cc);
      engineCapacityAdded = true;
    }

    if (Object.keys(patch).length === 0 && Object.keys(detailsPatch).length === 0) continue;

    // Mirror filled values into metadata.details without clobbering existing keys.
    const metadata = { ...(listing.metadata ?? {}) } as Record<string, Json>;
    const details = { ...detailsOf(listing) };
    for (const [key, value] of Object.entries(detailsPatch)) {
      if (details[key] === undefined || details[key] === null || String(details[key]).trim() === "") {
        details[key] = value;
      }
    }
    if (engineCapacityAdded && (metadata.engineCapacity === undefined || metadata.engineCapacity === null)) {
      metadata.engineCapacity = spec.cc!;
    }
    metadata.details = details;
    patch.metadata = metadata;

    for (const column of SPEC_COLUMNS) {
      if (patch[column] !== undefined) after[column] += 1;
    }
    if (engineCapacityAdded) after.engineCapacity += 1;

    updatedRows += 1;
    const label = `${listing.make ?? "?"} ${listing.model ?? "?"} ${listing.year ?? ""} (${listing.id})`;
    const fields = Object.entries(patch)
      .filter(([key]) => key !== "metadata")
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    console.log(
      `${dryRun ? "[dry-run] " : ""}${label}: ${fields}${engineCapacityAdded ? ` +engineCapacity=${spec.cc}` : ""}`,
    );

    if (!dryRun) {
      const { error: updateError } = await supabase.from("listings").update(patch).eq("id", listing.id);
      if (updateError) {
        console.error(`  FAILED: ${updateError.message}`);
      }
    }
  }

  console.log(`\nRows updated: ${updatedRows} of ${listings.length} active (${skippedNonCar} non-car rows skipped)`);
  console.log("Per-column non-null counts (before -> after):");
  for (const column of [...SPEC_COLUMNS, "engineCapacity"]) {
    console.log(`  ${column.padEnd(16)} ${before[column]} -> ${after[column]}  (total ${listings.length})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
