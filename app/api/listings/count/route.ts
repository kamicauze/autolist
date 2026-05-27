import { NextRequest, NextResponse } from "next/server";
import { countMatchingListings } from "@/lib/data/listings";
import { LISTING_CATEGORY_OPTIONS, type ListingCategory } from "@/lib/constants/marketplace";
import type { ListingFilters } from "@/lib/types/listing";

function parseArrayParam(value: string | null): string[] | undefined {
  if (!value) return undefined;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseCategoryParam(value: string | null): ListingCategory | undefined {
  if (!value) return undefined;

  return LISTING_CATEGORY_OPTIONS.some((item) => item.value === value)
    ? (value as ListingCategory)
    : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: ListingFilters = {
    q: params.get("q") || undefined,
    category: parseCategoryParam(params.get("category")),
    make: params.get("make") || undefined,
    model: params.get("model") || undefined,
    origin: params.get("origin") || undefined,
    equipmentType: parseArrayParam(params.get("equipmentType")),
    useCase: params.get("useCase") || undefined,
    intent: parseArrayParam(params.get("intent")),
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    minYear: params.get("minYear") ? Number(params.get("minYear")) : undefined,
    maxYear: params.get("maxYear") ? Number(params.get("maxYear")) : undefined,
    bodyType: parseArrayParam(params.get("bodyType")),
    transmission: parseArrayParam(params.get("transmission")),
    fuelType: parseArrayParam(params.get("fuelType")),
    condition: (params.get("condition") as ListingFilters["condition"]) || undefined,
    location: params.get("location") || undefined,
    color: params.get("color") || undefined,
    seats: params.get("seats") ? Number(params.get("seats")) : undefined,
    doors: params.get("doors") ? Number(params.get("doors")) : undefined,
    driveType: params.get("driveType") || undefined,
    sellerType: (params.get("sellerType") as ListingFilters["sellerType"]) || undefined,
    verifiedOnly: params.get("verifiedOnly") === "true",
    minMileage: params.get("minMileage") ? Number(params.get("minMileage")) : undefined,
    maxMileage: params.get("maxMileage") ? Number(params.get("maxMileage")) : undefined,
  };

  const count = await countMatchingListings(filters);
  return NextResponse.json({ count });
}
