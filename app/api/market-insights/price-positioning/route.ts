import { NextRequest, NextResponse } from "next/server";
import { getPricePositioning } from "@/lib/data/market-insights";
import type { PricePositioningInput } from "@/lib/types/market-insights";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<PricePositioningInput>;

  const result = await getPricePositioning({
    currentListingId: payload.currentListingId ?? null,
    make: payload.make || "",
    model: payload.model || "",
    year: payload.year ?? null,
    price: Number(payload.price || 0),
    currency: payload.currency ?? "KES",
    mileage: payload.mileage ?? null,
    bodyType: payload.bodyType ?? null,
    transmission: payload.transmission ?? null,
    fuelType: payload.fuelType ?? null,
  });

  return NextResponse.json(result);
}
