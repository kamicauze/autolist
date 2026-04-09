import { NextRequest, NextResponse } from "next/server";
import { buildSmartSearchUrl, evaluateSmartSearch } from "@/lib/ai/smart-search";
import { searchListings } from "@/lib/data/listings";
import { smartSearchParamsToListingFilters } from "@/lib/search/quick-search";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { query?: string };
  const result = await evaluateSmartSearch(payload.query || "");
  const preview = await searchListings({
    filters: smartSearchParamsToListingFilters(result.params),
    page: 1,
    limit: 6,
  });

  return NextResponse.json({
    ...result,
    searchUrl: buildSmartSearchUrl(result),
    preview,
  });
}
