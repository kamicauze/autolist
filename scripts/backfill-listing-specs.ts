/**
 * Backfill normalized spec columns on existing listings from real data already
 * present on each row (metadata keys + unambiguous title/description parsing).
 *
 * - Only fills NULL columns; never overwrites non-null values (idempotent).
 * - No guessed defaults except clearly safe cases (e.g. equipmentType=tractor -> body_type).
 *
 * Usage: npx tsx scripts/backfill-listing-specs.ts [--dry-run]
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
  description: string | null;
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

function meta(listing: ListingRow, ...keys: string[]): string | null {
  const sources: Array<Record<string, Json> | null> = [
    listing.metadata ?? null,
    (listing.metadata?.details as Record<string, Json> | undefined) ?? null,
  ];
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (value === null || value === undefined) continue;
      const text = String(value).trim();
      if (text) return text;
    }
  }
  return null;
}

function parseIntSafe(value: string | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[,\s]/g, "");
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Return the single distinct match of `pattern` in text, or null if 0 or 2+ distinct matches. */
function uniqueMatch(text: string, pattern: RegExp): string | null {
  const found = new Set<string>();
  for (const match of text.matchAll(pattern)) found.add(match[1].toLowerCase());
  return found.size === 1 ? [...found][0] : null;
}

function deriveFuelType(listing: ListingRow): string | null {
  const fromMeta = meta(listing, "fuelType", "fuel_type", "engineType");
  if (fromMeta) {
    const normalized = fromMeta.toLowerCase();
    if (["petrol", "diesel", "hybrid", "electric", "plugin_hybrid", "plug-in hybrid"].includes(normalized)) {
      return normalized === "plug-in hybrid" ? "plugin_hybrid" : normalized;
    }
  }
  const text = listing.description ?? "";
  return uniqueMatch(text, /\b(petrol|diesel|hybrid|electric)\b/gi);
}

function deriveTransmission(listing: ListingRow): string | null {
  const fromMeta = meta(listing, "transmission");
  if (fromMeta) {
    const normalized = fromMeta.toLowerCase();
    if (["automatic", "manual", "cvt", "semi-automatic", "semi_automatic", "amt"].includes(normalized)) {
      return normalized;
    }
  }
  const text = listing.description ?? "";
  return uniqueMatch(text, /\b(automatic|manual)\b(?:\s+transmission)?/gi);
}

function deriveMileage(listing: ListingRow): number | null {
  const fromMeta = parseIntSafe(meta(listing, "mileage"));
  if (fromMeta !== null) return fromMeta;

  const text = listing.description ?? "";
  // "Mileage 54k Kms" / "Mileage 54000 km" / "54,000 kms mileage"
  let match = text.match(/mileage[^0-9]{0,10}([\d,]+)\s*k\b/i);
  if (match) {
    const thousands = parseIntSafe(match[1]);
    return thousands !== null ? thousands * 1000 : null;
  }
  match = text.match(/mileage[^0-9]{0,10}([\d,]+)/i);
  if (match) return parseIntSafe(match[1]);
  match = text.match(/([\d,]+)\s*k?\s*kms?\s+mileage/i);
  if (match) return parseIntSafe(match[1]);
  return null;
}

function deriveSeats(listing: ListingRow): number | null {
  const fromMeta = parseIntSafe(meta(listing, "seats", "seatingCapacity"));
  if (fromMeta !== null && fromMeta > 0 && fromMeta <= 60) return fromMeta;
  const match = (listing.description ?? "").match(/\b(\d{1,2})[- ]seater\b/i);
  if (match) {
    const parsed = parseIntSafe(match[1]);
    if (parsed !== null && parsed > 0 && parsed <= 60) return parsed;
  }
  return null;
}

function deriveDoors(listing: ListingRow): number | null {
  const fromMeta = parseIntSafe(meta(listing, "doors"));
  if (fromMeta !== null && fromMeta > 0 && fromMeta <= 6) return fromMeta;
  const match = (listing.description ?? "").match(/\b(\d)[- ]doors?\b/i);
  if (match) {
    const parsed = parseIntSafe(match[1]);
    if (parsed !== null && parsed > 0 && parsed <= 6) return parsed;
  }
  return null;
}

function deriveDriveType(listing: ListingRow): string | null {
  const fromMeta = meta(listing, "driveType", "drive_type", "drivetrain");
  if (fromMeta) {
    const normalized = fromMeta.toLowerCase().replace("4x4", "4wd");
    if (["awd", "4wd", "2wd", "fwd", "rwd"].includes(normalized)) return normalized;
  }
  const text = listing.description ?? "";
  const match = uniqueMatch(text, /\b(awd|4wd|4x4|2wd|fwd|rwd)\b/gi);
  return match ? match.replace("4x4", "4wd") : null;
}

function deriveBodyType(listing: ListingRow): string | null {
  const fromMeta = meta(listing, "bodyType", "body_type");
  if (fromMeta) return fromMeta.toLowerCase();
  // Clearly safe category default: equipment explicitly recorded as a tractor.
  const equipmentType = meta(listing, "equipmentType");
  if (equipmentType && equipmentType.toLowerCase() === "tractor") return "tractor";
  const bikeType = meta(listing, "bikeType");
  if (bikeType) return bikeType.toLowerCase();
  return null;
}

function deriveEngineCapacity(listing: ListingRow): number | null {
  const fromMeta = parseIntSafe(meta(listing, "engineCapacity", "engineSize", "engine_capacity"));
  if (fromMeta !== null && fromMeta >= 49 && fromMeta <= 20000) return fromMeta;
  const text = listing.description ?? "";
  const match = uniqueMatch(text, /\b(\d{3,4})\s*cc\b/gi);
  if (match) {
    const parsed = parseIntSafe(match);
    if (parsed !== null && parsed >= 49 && parsed <= 20000) return parsed;
  }
  return null;
}

async function main() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, make, model, description, fuel_type, transmission, mileage, seats, doors, drive_type, body_type, metadata");
  if (error) throw error;

  const listings = (data ?? []) as ListingRow[];
  const before: Record<string, number> = {};
  const after: Record<string, number> = {};
  for (const column of SPEC_COLUMNS) {
    before[column] = listings.filter((listing) => listing[column] !== null).length;
    after[column] = before[column];
  }
  before.engineCapacity = listings.filter((listing) => meta(listing, "engineCapacity") !== null).length;
  after.engineCapacity = before.engineCapacity;

  let updatedRows = 0;
  for (const listing of listings) {
    const patch: Record<string, Json> = {};

    if (listing.fuel_type === null) {
      const value = deriveFuelType(listing);
      if (value) patch.fuel_type = value;
    }
    if (listing.transmission === null) {
      const value = deriveTransmission(listing);
      if (value) patch.transmission = value;
    }
    if (listing.mileage === null) {
      const value = deriveMileage(listing);
      if (value !== null) patch.mileage = value;
    }
    if (listing.seats === null) {
      const value = deriveSeats(listing);
      if (value !== null) patch.seats = value;
    }
    if (listing.doors === null) {
      const value = deriveDoors(listing);
      if (value !== null) patch.doors = value;
    }
    if (listing.drive_type === null) {
      const value = deriveDriveType(listing);
      if (value) patch.drive_type = value;
    }
    if (listing.body_type === null) {
      const value = deriveBodyType(listing);
      if (value) patch.body_type = value;
    }

    // Engine capacity lives in metadata (no dedicated column). Only add when missing.
    const hasEngineCapacity = meta(listing, "engineCapacity") !== null;
    const engineCapacity = hasEngineCapacity ? null : deriveEngineCapacity(listing);
    if (engineCapacity !== null) {
      const metadata = { ...(listing.metadata ?? {}) } as Record<string, Json>;
      metadata.engineCapacity = engineCapacity;
      const details = { ...((metadata.details as Record<string, Json>) ?? {}) };
      if (details.engineCapacity === undefined) details.engineCapacity = String(engineCapacity);
      metadata.details = details;
      patch.metadata = metadata;
      after.engineCapacity += 1;
    }

    if (Object.keys(patch).length === 0) continue;

    for (const column of SPEC_COLUMNS) {
      if (patch[column] !== undefined) after[column] += 1;
    }

    updatedRows += 1;
    const label = `${listing.make ?? "?"} ${listing.model ?? "?"} (${listing.id})`;
    const fields = Object.entries(patch)
      .filter(([key]) => key !== "metadata")
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    console.log(`${dryRun ? "[dry-run] " : ""}${label}: ${fields}${patch.metadata ? " +metadata.engineCapacity" : ""}`);

    if (!dryRun) {
      const { error: updateError } = await supabase.from("listings").update(patch).eq("id", listing.id);
      if (updateError) {
        console.error(`  FAILED: ${updateError.message}`);
      }
    }
  }

  console.log(`\nRows updated: ${updatedRows} of ${listings.length}`);
  console.log("Per-column non-null counts (before -> after):");
  for (const column of [...SPEC_COLUMNS, "engineCapacity"]) {
    console.log(`  ${column.padEnd(16)} ${before[column]} -> ${after[column]}  (total ${listings.length})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
