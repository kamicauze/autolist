import { NextRequest, NextResponse } from "next/server";
import { suggestListingFeatureIds } from "@/lib/ai/listing-feature-suggestions";
import type { ListingFeatureSuggestionInput } from "@/lib/types/listing-feature-suggestions";

function parseOptionalNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<ListingFeatureSuggestionInput>;

  const result = await suggestListingFeatureIds({
    category: payload.category || "",
    make: payload.make || "",
    model: payload.model || "",
    trim: payload.trim ?? null,
    variant: payload.variant ?? null,
    year: parseOptionalNumber(payload.year),
    bodyType: payload.bodyType ?? null,
    fuelType: payload.fuelType ?? null,
    transmission: payload.transmission ?? null,
    equipmentType: payload.equipmentType ?? null,
  });

  return NextResponse.json(result);
}
