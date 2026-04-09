import { NextRequest, NextResponse } from "next/server";
import { evaluateListingQuality } from "@/lib/ai/listing-quality";
import type { ListingQualityInput } from "@/lib/types/listing-quality";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<ListingQualityInput>;

  const result = await evaluateListingQuality({
    title: payload.title || "",
    make: payload.make || "",
    model: payload.model || "",
    year: payload.year ?? null,
    price: Number(payload.price || 0),
    mileage: payload.mileage ?? null,
    bodyType: payload.bodyType ?? null,
    transmission: payload.transmission ?? null,
    fuelType: payload.fuelType ?? null,
    description: payload.description || "",
    featuresCount: Number(payload.featuresCount || 0),
    imageCount: Number(payload.imageCount || 0),
    cityTown: payload.cityTown || "",
    locationArea: payload.locationArea || "",
    contactName: payload.contactName || "",
    phoneNumber: payload.phoneNumber || "",
  });

  return NextResponse.json(result);
}
