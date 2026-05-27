import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types/listing";
import { computePricePositioning } from "@/lib/market/price-positioning";
import type { PricePositioningInput, PricePositioningResult } from "@/lib/types/market-insights";

type CandidateRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  metadata: Record<string, unknown> | null;
  dealer?: {
    city: string | null;
  } | null;
};

type RawCandidateRow = Omit<CandidateRow, "dealer"> & {
  dealer?: { city: string | null }[] | { city: string | null } | null;
};

function dedupeCandidates(rows: CandidateRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function isGenericEquipmentReference(input: PricePositioningInput) {
  const make = input.make.trim().toLowerCase();
  return make === "farm equipment" || make === "plant equipment";
}

async function fetchCandidateGroup(input: PricePositioningInput) {
  const supabase = await createClient();
  const queries = [];

  if (input.make && input.model) {
    const inputYear = typeof input.year === "number" && Number.isFinite(input.year)
      ? input.year
      : null;
    let query = supabase
      .from("listings")
      .select("id, make, model, year, price, mileage, body_type, transmission, fuel_type, metadata, dealer:dealers(city)")
      .eq("status", "active")
      .ilike("make", input.make.trim())
      .ilike("model", input.model.trim())
      .limit(40);

    if (inputYear && inputYear > 0) {
      query = query.gte("year", inputYear - 1).lte("year", inputYear + 1);
    }

    queries.push(query);
  }

  const results = await Promise.all(queries);
  const rows = results.flatMap((result) => {
    if (result.error) {
      console.error("Error fetching price positioning candidates:", result.error);
      return [] as CandidateRow[];
    }
    return ((result.data || []) as RawCandidateRow[]).map((row) => ({
      ...row,
      dealer: Array.isArray(row.dealer) ? (row.dealer[0] ?? null) : row.dealer ?? null,
    }));
  });

  return dedupeCandidates(rows);
}

export async function getPricePositioning(
  input: PricePositioningInput
): Promise<PricePositioningResult> {
  const hasValidYear =
    typeof input.year === "number" && Number.isFinite(input.year) && input.year > 0;

  if (
    !input.make.trim() ||
    !input.model.trim() ||
    !hasValidYear ||
    isGenericEquipmentReference(input) ||
    !Number.isFinite(input.price) ||
    input.price <= 0
  ) {
    return {
      status: "insufficient_data",
      label: "Incomplete pricing data",
      tone: "neutral",
      note: isGenericEquipmentReference(input)
        ? "Add the actual make and model to compare against truly similar machinery."
        : "Add make, model, year and a valid price to estimate market position.",
      confidence: "low",
      confidenceLabel: "Low confidence",
      basedOn: "missing listing details",
      sampleSize: 0,
      marketAverage: null,
      marketMedian: null,
      marketMin: null,
      marketMax: null,
      differenceFromMedian: null,
      percentageFromMedian: null,
      comparables: [],
    };
  }

  const candidates = await fetchCandidateGroup(input);
  return computePricePositioning(input, candidates);
}

export async function getListingPricePositioning(
  listing: Listing
): Promise<PricePositioningResult> {
  return getPricePositioning({
    currentListingId: listing.id,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    price: listing.price,
    currency: listing.currency,
    mileage: listing.mileage,
    bodyType: listing.body_type,
    transmission: listing.transmission,
    fuelType: listing.fuel_type,
  });
}
