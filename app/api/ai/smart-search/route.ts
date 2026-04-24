import { NextRequest, NextResponse } from "next/server";
import { buildSmartSearchUrl, evaluateSmartSearch } from "@/lib/ai/smart-search";
import { searchListings } from "@/lib/data/listings";
import {
  applyAssistantSearchTurn,
  hasNearMeIntent,
  sanitizeSmartSearchParams,
  smartSearchParamsToListingFilters,
} from "@/lib/search/quick-search";
import type { Listing } from "@/lib/types/listing";
import type { SmartSearchClarification, SmartSearchResult } from "@/lib/types/smart-search";
import { getListingDisplayLocation } from "@/lib/utils/vehicle-display";

function getPrimaryBodyType(bodyType?: string) {
  return bodyType?.split(",").map((value) => value.trim()).find(Boolean)?.toLowerCase() || "car";
}

function buildClarification(
  originalQuery: string,
  result: SmartSearchResult,
  previewTotal: number
): SmartSearchClarification | null {
  const primaryBodyType = getPrimaryBodyType(result.params.bodyType);
  const hasExplicitVehicle = Boolean(result.params.make || result.params.model);

  if (hasNearMeIntent(originalQuery) && !result.params.location) {
    return {
      question: "Which area should I use?",
      options: [
        { label: "Nairobi", query: "in Nairobi" },
        { label: "Kiambu / Ruiru", query: "in Ruiru" },
        { label: "Mombasa", query: "in Mombasa" },
        { label: "Nakuru", query: "in Nakuru" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.origin) {
    if (result.params.origin === "European") {
      return {
        question:
          previewTotal > 0
            ? `Narrow the European ${primaryBodyType}s?`
            : `Few European ${primaryBodyType}s. Try one of these?`,
        options: [
          { label: "German only", query: `german ${primaryBodyType}` },
          { label: "Premium / executive", query: `executive ${primaryBodyType}` },
          { label: "Under 3m", query: "under 3m" },
        ],
      };
    }

    if (result.params.origin === "German") {
      return {
        question: `Narrow the German ${primaryBodyType}s?`,
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
      question: "First car: narrow by budget, automatic, or hatchback?",
      options: [
        { label: "Under 1.5m", query: "under 1.5m" },
        { label: "Automatic only", query: "automatic only" },
        { label: "Hatchback only", query: "hatchback only" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.useCase === "family") {
    return {
      question: "Family car: SUV, 7 seats, or budget?",
      options: [
        { label: "SUV only", query: "SUV only" },
        { label: "7 seater", query: "7 seater" },
        { label: "Under 3m", query: "under 3m" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.useCase === "executive") {
    return {
      question: "Executive: sedan, SUV, or German?",
      options: [
        { label: "Sedan only", query: "sedan only" },
        { label: "SUV only", query: "SUV only" },
        { label: "German only", query: "german only" },
      ],
    };
  }

  if (!hasExplicitVehicle && result.params.useCase === "fuel_efficient") {
    return {
      question: "Fuel efficient: hybrid, small automatic, or budget?",
      options: [
        { label: "Hybrid only", query: "hybrid only" },
        { label: "Small automatic", query: "small automatic" },
        { label: "Under 2m", query: "under 2m" },
      ],
    };
  }

  return null;
}

type RefinementOption = SmartSearchClarification["options"][number] & {
  score: number;
};

function splitCsv(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function hasCsvValue(value: string | undefined, candidate: string) {
  return splitCsv(value).includes(candidate.trim().toLowerCase());
}

function addUniqueOption(options: RefinementOption[], option: RefinementOption) {
  if (options.some((item) => item.query.toLowerCase() === option.query.toLowerCase())) {
    return;
  }

  options.push(option);
}

function getTopFacet(
  listings: Listing[],
  getValue: (listing: Listing) => string | null | undefined
) {
  const counts = new Map<string, number>();

  listings.forEach((listing) => {
    const value = getValue(listing)?.trim();
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .find(([, count]) => count > 0 && count < listings.length);
}

function formatBudgetQuery(value: number) {
  const millions = value / 1_000_000;
  return Number.isInteger(millions) ? `${millions}m` : `${millions.toFixed(1).replace(/\.0$/, "")}m`;
}

function getNarrowingBudget(listings: Listing[], currentMaxPrice?: string) {
  const prices = listings
    .map((listing) => Number(listing.price))
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);

  if (prices.length < 2) return null;

  const currentMax = currentMaxPrice ? Number(currentMaxPrice) : null;
  const thresholds = [1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_000_000, 5_000_000, 8_000_000, 10_000_000];
  return thresholds.find((threshold) => {
    if (currentMax && threshold >= currentMax) return false;
    const count = prices.filter((price) => price <= threshold).length;
    return count > 0 && count < prices.length;
  }) || null;
}

function getNarrowingYear(listings: Listing[], currentMinYear?: string) {
  const years = listings
    .map((listing) => Number(listing.year))
    .filter((year) => Number.isFinite(year) && year > 1990)
    .sort((a, b) => a - b);

  if (years.length < 2) return null;

  const currentMin = currentMinYear ? Number(currentMinYear) : null;
  const thresholds = [2016, 2018, 2020, 2022, 2024];
  return thresholds.find((threshold) => {
    if (currentMin && threshold <= currentMin) return false;
    const count = years.filter((year) => year >= threshold).length;
    return count > 0 && count < years.length;
  }) || null;
}

function buildRefinement(result: SmartSearchResult, previewListings: Listing[], previewTotal: number) {
  if (previewTotal <= 1 || previewListings.length <= 1) {
    return null;
  }

  const options: RefinementOption[] = [];
  const topBodyType = getTopFacet(previewListings, (listing) => listing.body_type);
  const topLocation = getTopFacet(previewListings, (listing) =>
    getListingDisplayLocation(listing, { fallback: "" })
  );
  const topMake = getTopFacet(previewListings, (listing) => listing.make);
  const topTransmission = getTopFacet(previewListings, (listing) => listing.transmission);
  const budget = getNarrowingBudget(previewListings, result.params.maxPrice);
  const year = getNarrowingYear(previewListings, result.params.minYear);

  if (topBodyType && !hasCsvValue(result.params.bodyType, topBodyType[0])) {
    addUniqueOption(options, {
      label: `${topBodyType[0]} only`,
      query: `${topBodyType[0]} only`,
      score: 90 + topBodyType[1],
    });
  }

  if (budget) {
    const formatted = formatBudgetQuery(budget);
    addUniqueOption(options, {
      label: `Under ${formatted}`,
      query: `under ${formatted}`,
      score: 85,
    });
  }

  if (topLocation && !hasCsvValue(result.params.location, topLocation[0])) {
    addUniqueOption(options, {
      label: `${topLocation[0]} only`,
      query: `in ${topLocation[0]}`,
      score: 80 + topLocation[1],
    });
  }

  if (topMake && !hasCsvValue(result.params.make, topMake[0])) {
    addUniqueOption(options, {
      label: `${topMake[0]} only`,
      query: `${topMake[0]} only`,
      score: 70 + topMake[1],
    });
  }

  if (topTransmission && !hasCsvValue(result.params.transmission, topTransmission[0])) {
    addUniqueOption(options, {
      label: `${topTransmission[0]} only`,
      query: `${topTransmission[0]} only`,
      score: 65 + topTransmission[1],
    });
  }

  if (year) {
    addUniqueOption(options, {
      label: `${year}+`,
      query: `${year} or newer`,
      score: 60,
    });
  }

  const selectedOptions = options
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ label, query }) => ({ label, query }));

  if (selectedOptions.length === 0) {
    return null;
  }

  return {
    question: "Narrow by one?",
    options: selectedOptions,
  };
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
  const clarification = buildClarification(payload.query || "", result, preview.total);

  return NextResponse.json({
    ...result,
    clarification,
    refinement: clarification ? null : buildRefinement(result, preview.listings, preview.total),
    searchUrl: buildSmartSearchUrl(result),
    preview,
  });
}
