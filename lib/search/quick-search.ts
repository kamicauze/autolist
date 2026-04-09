import type { SmartSearchParams, SmartSearchResult } from "@/lib/types/smart-search";
import type { ListingFilters } from "@/lib/types/listing";

const MAKE_ALIASES = [
  ["toyota", "Toyota"],
  ["bmw", "BMW"],
  ["mercedes-benz", "Mercedes-Benz"],
  ["mercedes benz", "Mercedes-Benz"],
  ["mercedes", "Mercedes-Benz"],
  ["audi", "Audi"],
  ["honda", "Honda"],
  ["nissan", "Nissan"],
  ["mazda", "Mazda"],
  ["subaru", "Subaru"],
  ["volkswagen", "Volkswagen"],
  ["vw", "Volkswagen"],
  ["land rover", "Land Rover"],
  ["range rover", "Land Rover"],
  ["porsche", "Porsche"],
  ["lexus", "Lexus"],
  ["mitsubishi", "Mitsubishi"],
  ["suzuki", "Suzuki"],
  ["hyundai", "Hyundai"],
  ["kia", "Kia"],
  ["ford", "Ford"],
  ["chevrolet", "Chevrolet"],
  ["jeep", "Jeep"],
  ["peugeot", "Peugeot"],
  ["isuzu", "Isuzu"],
  ["volvo", "Volvo"],
  ["jaguar", "Jaguar"],
  ["mini", "Mini"],
  ["daihatsu", "Daihatsu"],
  ["renault", "Renault"],
  ["tesla", "Tesla"],
] as const;

const BODY_TYPE_ALIASES = [
  ["sedan", "Sedan"],
  ["saloon", "Sedan"],
  ["suv", "SUV"],
  ["4x4", "SUV"],
  ["hatchback", "Hatchback"],
  ["pickup", "Pickup"],
  ["pick-up", "Pickup"],
  ["truck", "Truck"],
  ["van", "Van"],
  ["coupe", "Coupe"],
  ["convertible", "Convertible"],
  ["wagon", "Wagon"],
  ["estate", "Wagon"],
  ["crossover", "Crossover"],
] as const;

const FUEL_TYPE_ALIASES = [
  ["petrol", "Petrol"],
  ["gasoline", "Petrol"],
  ["diesel", "Diesel"],
  ["hybrid", "Hybrid"],
  ["electric", "Electric"],
  ["ev", "Electric"],
  ["plug-in hybrid", "Hybrid"],
] as const;

const TRANSMISSION_ALIASES = [
  ["automatic", "Automatic"],
  ["auto", "Automatic"],
  ["manual", "Manual"],
  ["stick", "Manual"],
] as const;

const LOCATION_ALIASES = [
  ["nairobi", "Nairobi"],
  ["mombasa", "Mombasa"],
  ["kisumu", "Kisumu"],
  ["nakuru", "Nakuru"],
  ["eldoret", "Eldoret"],
  ["thika", "Thika"],
  ["nyeri", "Nyeri"],
  ["malindi", "Malindi"],
  ["kiambu", "Kiambu"],
  ["ruiru", "Ruiru"],
] as const;

const MODEL_STOPWORDS = new Set([
  "under",
  "below",
  "above",
  "over",
  "from",
  "in",
  "with",
  "automatic",
  "manual",
  "diesel",
  "petrol",
  "hybrid",
  "electric",
  "suv",
  "sedan",
  "hatchback",
  "pickup",
  "truck",
  "van",
  "dealer",
  "private",
  "cars",
  "car",
  "vehicle",
  "vehicles",
  "reliable",
  "family",
  "budget",
]);

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findAliasMatch(value: string, aliases: readonly (readonly [string, string])[]) {
  const padded = ` ${value} `;
  for (const [alias, normalized] of aliases) {
    if (padded.includes(` ${alias} `)) {
      return normalized;
    }
  }
  return null;
}

function findAliasMatches(value: string, aliases: readonly (readonly [string, string])[]) {
  const padded = ` ${value} `;
  const matches: string[] = [];

  for (const [alias, normalized] of aliases) {
    if (padded.includes(` ${alias} `) && !matches.includes(normalized)) {
      matches.push(normalized);
    }
  }

  return matches;
}

function parsePrice(lower: string, direction: "min" | "max") {
  const matcher =
    direction === "max"
      ? /(?:under|below|max|budget|less than|cheaper than)\s*(?:ksh?|kes)?\s*([\d,.]+)\s*(million|m|k)?/i
      : /(?:above|over|from|min|more than|starting at)\s*(?:ksh?|kes)?\s*([\d,.]+)\s*(million|m|k)?/i;
  const match = lower.match(matcher);
  if (!match) return null;

  let amount = Number.parseFloat(match[1].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const unit = match[2]?.toLowerCase();
  if (unit === "million" || unit === "m") {
    amount *= 1_000_000;
  } else if (unit === "k") {
    amount *= 1_000;
  } else if (amount < 1000) {
    amount *= 1_000_000;
  }

  return String(Math.round(amount));
}

function parseYearRange(query: string) {
  const yearMatches = Array.from(query.matchAll(/\b(19\d{2}|20[0-3]\d)\b/g)).map((match) => match[1]);
  if (yearMatches.length === 0) {
    return { minYear: undefined, maxYear: undefined };
  }

  if (yearMatches.length === 1) {
    return { minYear: yearMatches[0], maxYear: undefined };
  }

  const sorted = yearMatches.sort();
  return {
    minYear: sorted[0],
    maxYear: sorted[sorted.length - 1],
  };
}

function extractModel(query: string, make: string | undefined) {
  if (!make) return undefined;

  const lower = query.toLowerCase();
  const makeAlias = MAKE_ALIASES.find(([, normalized]) => normalized === make)?.[0] || make.toLowerCase();
  const makeIndex = lower.indexOf(makeAlias);
  if (makeIndex === -1) return undefined;

  const afterMake = compactWhitespace(query.slice(makeIndex + makeAlias.length));
  if (!afterMake) return undefined;

  const cleaned = afterMake
    .replace(/\b(19\d{2}|20[0-3]\d)\b/g, " ")
    .replace(/(?:under|below|max|budget|less than|cheaper than|above|over|from|min|in|with)\b.*$/i, " ")
    .replace(/[^\p{L}\p{N}\- ]/gu, " ");

  const tokens = compactWhitespace(cleaned)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !MODEL_STOPWORDS.has(token.toLowerCase()))
    .slice(0, 2);

  if (tokens.length === 0) return undefined;
  return tokens.join(" ");
}

function deriveConfidence(params: SmartSearchParams) {
  const populatedCount = Object.values(params).filter(Boolean).length;
  if (params.make && (params.model || params.bodyType || params.maxPrice || params.location)) {
    return "high" as const;
  }
  if (populatedCount >= 2) {
    return "medium" as const;
  }
  return "low" as const;
}

export function parseQuickSearchRules(query: string): SmartSearchResult {
  const normalizedQuery = compactWhitespace(query);
  const lower = normalizedQuery.toLowerCase();

  if (!normalizedQuery) {
    return {
      normalizedQuery,
      params: {},
      provider: "rules",
      model: null,
      confidence: "low",
      note: "Enter a make, model, budget, year or location to search.",
    };
  }

  const make = findAliasMatch(lower, MAKE_ALIASES) || undefined;
  const bodyTypeMatches = findAliasMatches(lower, BODY_TYPE_ALIASES);
  const expandedBodyTypes = [...bodyTypeMatches];

  if (bodyTypeMatches.includes("Crossover") && !expandedBodyTypes.includes("SUV")) {
    expandedBodyTypes.push("SUV");
  }

  if (bodyTypeMatches.includes("SUV") && lower.includes("crossover") && !expandedBodyTypes.includes("Crossover")) {
    expandedBodyTypes.push("Crossover");
  }

  const bodyType =
    expandedBodyTypes.length > 0 ? expandedBodyTypes.join(",") : undefined;
  const fuelType = findAliasMatch(lower, FUEL_TYPE_ALIASES) || undefined;
  const transmission = findAliasMatch(lower, TRANSMISSION_ALIASES) || undefined;
  const location = findAliasMatch(lower, LOCATION_ALIASES) || undefined;
  const { minYear, maxYear } = parseYearRange(normalizedQuery);
  const maxPrice = parsePrice(lower, "max") || undefined;
  const minPrice = parsePrice(lower, "min") || undefined;
  const sellerType = lower.includes("dealer")
    ? "dealer"
    : lower.includes("private")
      ? "private"
      : undefined;
  const model = extractModel(normalizedQuery, make);

  const params: SmartSearchParams = {
    make,
    model,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    bodyType,
    transmission,
    fuelType,
    location,
    sellerType,
  };

  if (Object.values(params).every((value) => !value)) {
    params.q = normalizedQuery;
  }

  return {
    normalizedQuery,
    params,
    provider: "rules",
    model: null,
    confidence: deriveConfidence(params),
    note:
      params.q && Object.keys(params).length === 1
        ? "Using broad text search because the rules could not extract strong filters."
        : "Matched filters from the query using rule-based parsing.",
  };
}

export function shouldUseSmartSearchFallback(query: string, result: SmartSearchResult) {
  if (!query.trim()) return false;
  if (result.confidence === "high") return false;

  const lower = query.toLowerCase();
  const intentWords = ["reliable", "family", "best", "cheap", "comfortable", "daily", "road trip"];
  if (intentWords.some((word) => lower.includes(word))) {
    return true;
  }

  const tokenCount = compactWhitespace(query).split(" ").filter(Boolean).length;
  return tokenCount >= 4 || Boolean(result.params.q);
}

export function sanitizeSmartSearchParams(input: Partial<SmartSearchParams>): SmartSearchParams {
  const params: SmartSearchParams = {};

  const assign = <K extends keyof SmartSearchParams>(key: K, value: SmartSearchParams[K]) => {
    if (typeof value === "string" && value.trim()) {
      params[key] = value.trim() as SmartSearchParams[K];
    } else if (value) {
      params[key] = value;
    }
  };

  assign("q", input.q);
  assign("make", input.make);
  assign("model", input.model);
  assign("minPrice", input.minPrice);
  assign("maxPrice", input.maxPrice);
  assign("minYear", input.minYear);
  assign("maxYear", input.maxYear);
  assign("bodyType", input.bodyType);
  assign("transmission", input.transmission);
  assign("fuelType", input.fuelType);
  assign("location", input.location);
  assign("sellerType", input.sellerType);

  return params;
}

export function buildSearchParams(params: SmartSearchParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  return searchParams;
}

function parseMaybeArray(value?: string) {
  if (!value) return undefined;
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return undefined;
  return items.length === 1 ? items[0] : items;
}

export function smartSearchParamsToListingFilters(params: SmartSearchParams): ListingFilters {
  return {
    q: params.q,
    make: params.make,
    model: params.model,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minYear: params.minYear ? Number(params.minYear) : undefined,
    maxYear: params.maxYear ? Number(params.maxYear) : undefined,
    bodyType: parseMaybeArray(params.bodyType),
    transmission: parseMaybeArray(params.transmission),
    fuelType: parseMaybeArray(params.fuelType),
    location: params.location,
    sellerType: params.sellerType,
  };
}
