import { NextRequest, NextResponse } from "next/server";
import { buildSmartSearchUrl, evaluateSmartSearch } from "@/lib/ai/smart-search";
import { searchListings } from "@/lib/data/listings";
import {
  applyAssistantSearchTurn,
  sanitizeSmartSearchParams,
  smartSearchParamsToListingFilters,
} from "@/lib/search/quick-search";
import type { SmartSearchClarification, SmartSearchResult } from "@/lib/types/smart-search";

function getPrimaryBodyType(bodyType?: string) {
  return bodyType?.split(",").map((value) => value.trim()).find(Boolean)?.toLowerCase() || "car";
}

function buildClarification(
  _originalQuery: string,
  result: SmartSearchResult,
  previewTotal: number
): SmartSearchClarification | null {
  const primaryBodyType = getPrimaryBodyType(result.params.bodyType);
  const hasExplicitVehicle = Boolean(result.params.make || result.params.model);

  if (!hasExplicitVehicle && result.params.origin) {
    if (result.params.origin === "European") {
      return {
        question:
          previewTotal > 0
            ? `I interpreted that as ${primaryBodyType}s from European brands. Do you want to narrow it further?`
            : `I interpreted that as ${primaryBodyType}s from European brands, but the inventory is thin. Which direction should I take?`,
        options: [
          { label: "German only", query: `german ${primaryBodyType}` },
          { label: "Premium / executive", query: `executive ${primaryBodyType}` },
          { label: "Under 3m", query: "under 3m" },
        ],
      };
    }

    if (result.params.origin === "German") {
      return {
        question: `I interpreted that as German-brand ${primaryBodyType}s. Do you want a tighter refinement?`,
        options: [
          { label: "BMW only", query: `BMW ${primaryBodyType}` },
          { label: "Mercedes only", query: `Mercedes ${primaryBodyType}` },
          { label: "Under 4m", query: "under 4m" },
        ],
      };
    }
  }

  if (!hasExplicitVehicle && result.params.useCase === "first_car") {
    return {
      question: "For a first car, the next thing that matters is usually budget or ease of driving. Which way should I refine it?",
      options: [
        { label: "Under 1.5m", query: "under 1.5m" },
        { label: "Automatic only", query: "automatic only" },
        { label: "Hatchback only", query: "hatchback only" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.useCase === "family") {
    return {
      question: "Family cars can mean different things. Which direction do you want?",
      options: [
        { label: "SUV only", query: "SUV only" },
        { label: "7 seater", query: "7 seater" },
        { label: "Under 3m", query: "under 3m" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.useCase === "executive") {
    return {
      question: "Executive can mean premium sedans or premium SUVs. Which should I prioritize?",
      options: [
        { label: "Sedan only", query: "sedan only" },
        { label: "SUV only", query: "SUV only" },
        { label: "German only", query: "german only" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.useCase === "fuel_efficient") {
    return {
      question: "Do you want the cheapest cars to run, or just efficient daily drivers?",
      options: [
        { label: "Hybrid only", query: "hybrid only" },
        { label: "Small automatic", query: "small automatic" },
        { label: "Under 2m", query: "under 2m" },
      ],
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    query?: string;
    currentParams?: SmartSearchResult["params"];
  };
  const turnQuery = payload.query || "";
  const baseResult = await evaluateSmartSearch(turnQuery);
  const mergedParams = applyAssistantSearchTurn(
    sanitizeSmartSearchParams(payload.currentParams || {}),
    turnQuery,
    baseResult.params
  );
  const result: SmartSearchResult = {
    ...baseResult,
    params: mergedParams,
  };
  const preview = await searchListings({
    filters: smartSearchParamsToListingFilters(result.params),
    page: 1,
    limit: 6,
  });

  return NextResponse.json({
    ...result,
    clarification: buildClarification(payload.query || "", result, preview.total),
    searchUrl: buildSmartSearchUrl(result),
    preview,
  });
}
