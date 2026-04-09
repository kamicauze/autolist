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

async function fetchCandidateGroup(input: PricePositioningInput) {
  const supabase = await createClient();
  const queries = [];

  if (input.make && input.model) {
    queries.push(
      supabase
        .from("listings")
        .select("id, make, model, year, price, mileage, body_type, transmission, fuel_type, dealer:dealers(city)")
        .eq("status", "active")
        .ilike("make", input.make)
        .ilike("model", input.model)
        .limit(30)
    );
  }

  if (input.make && input.bodyType) {
    queries.push(
      supabase
        .from("listings")
        .select("id, make, model, year, price, mileage, body_type, transmission, fuel_type, dealer:dealers(city)")
        .eq("status", "active")
        .ilike("make", input.make)
        .eq("body_type", input.bodyType)
        .limit(30)
    );
  }

  if (input.make) {
    queries.push(
      supabase
        .from("listings")
        .select("id, make, model, year, price, mileage, body_type, transmission, fuel_type, dealer:dealers(city)")
        .eq("status", "active")
        .ilike("make", input.make)
        .limit(30)
    );
  }

  if (input.bodyType) {
    queries.push(
      supabase
        .from("listings")
        .select("id, make, model, year, price, mileage, body_type, transmission, fuel_type, dealer:dealers(city)")
        .eq("status", "active")
        .eq("body_type", input.bodyType)
        .limit(30)
    );
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
  if (!input.make.trim() || !input.model.trim() || !Number.isFinite(input.price) || input.price <= 0) {
    return {
      status: "insufficient_data",
      label: "Incomplete pricing data",
      tone: "neutral",
      note: "Add make, model and a valid price to estimate market position.",
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
