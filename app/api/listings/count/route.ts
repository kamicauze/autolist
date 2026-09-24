import { NextRequest, NextResponse } from "next/server";
import { countMatchingListings } from "@/lib/data/listings";
import { parseSearchListingFilters } from "@/lib/search/search-listing-filters";

export async function GET(request: NextRequest) {
  const count = await countMatchingListings(parseSearchListingFilters(request.nextUrl.searchParams));
  return NextResponse.json({ count });
}
