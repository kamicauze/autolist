import { NextRequest, NextResponse } from "next/server";
import { generateVehicleComparison } from "@/lib/ai/vehicle-comparison";
import { getListingsByIds } from "@/lib/data/listings";
import { normalizeCompareIds } from "@/lib/utils/compare";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { ids?: unknown };
  const ids = normalizeCompareIds(
    Array.isArray(payload.ids) ? payload.ids.filter((id): id is string => typeof id === "string") : []
  );

  if (ids.length === 0) {
    return NextResponse.json({
      headline: "AI comparison",
      summary: "Add at least two vehicles to compare them.",
      bestFor: [],
      modelInsights: [],
      modelComparisons: [],
      tradeoffs: [],
      watchouts: [],
      provider: "rules",
      model: null,
      researchMode: "listing_only",
      sources: [],
    });
  }

  const listings = await getListingsByIds(ids);
  const comparison = await generateVehicleComparison(listings);

  return NextResponse.json(comparison, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
