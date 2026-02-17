import { NextRequest, NextResponse } from "next/server";
import { getListingsByIds } from "@/lib/data/listings";
import { parseCompareIds } from "@/lib/utils/compare";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  const ids = parseCompareIds(idsParam);

  if (ids.length === 0) {
    return NextResponse.json({ listings: [] });
  }

  const listings = await getListingsByIds(ids);

  return NextResponse.json({ listings });
}
