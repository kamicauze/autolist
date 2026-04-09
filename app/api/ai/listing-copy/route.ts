import { NextRequest, NextResponse } from "next/server";
import { generateListingCopySuggestion } from "@/lib/ai/listing-copy";
import type { ListingCopyInput } from "@/lib/types/listing-copy";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<ListingCopyInput>;

  const result = await generateListingCopySuggestion({
    category: payload.category || "",
    title: payload.title || "",
    description: payload.description || "",
    condition: payload.condition || "",
    price: Number(payload.price || 0),
    cityTown: payload.cityTown || "",
    locationArea: payload.locationArea || "",
    make: payload.make || "",
    model: payload.model || "",
    year: payload.year ?? null,
    transmission: payload.transmission ?? null,
    fuelType: payload.fuelType ?? null,
    bodyType: payload.bodyType ?? null,
    mileage: payload.mileage ?? null,
    color: payload.color ?? null,
    features: Array.isArray(payload.features) ? payload.features : [],
  });

  return NextResponse.json(result);
}
