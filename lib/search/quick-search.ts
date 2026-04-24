import type { SmartSearchParams, SmartSearchResult } from "@/lib/types/smart-search";
import type { ListingFilters } from "@/lib/types/listing";
import {
  detectVehicleIntents,
  detectVehicleOrigin,
  detectVehicleUseCase,
} from "@/lib/search/vehicle-ontology";

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

const INTENT_BODY_TYPE_ALIASES = [
  ["small car", ["Hatchback"]],
  ["compact car", ["Hatchback"]],
  ["city car", ["Hatchback"]],
  ["town car", ["Hatchback"]],
  ["family suv", ["SUV"]],
] as const satisfies ReadonlyArray<readonly [string, readonly string[]]>;

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

const DRIVE_TYPE_ALIASES = [
  ["all wheel drive", "AWD"],
  ["all-wheel drive", "AWD"],
  ["allwheel drive", "AWD"],
  ["awd", "AWD"],
  ["quattro", "AWD"],
  ["xdrive", "AWD"],
  ["x-drive", "AWD"],
  ["4matic", "AWD"],
  ["four wheel drive", "4WD"],
  ["four-wheel drive", "4WD"],
  ["4 wheel drive", "4WD"],
  ["4-wheel drive", "4WD"],
  ["4wd", "4WD"],
  ["4x4", "4WD"],
  ["front wheel drive", "FWD"],
  ["front-wheel drive", "FWD"],
  ["fwd", "FWD"],
  ["rear wheel drive", "RWD"],
  ["rear-wheel drive", "RWD"],
  ["rwd", "RWD"],
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
  ["kitale", "Kitale"],
  ["garissa", "Garissa"],
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
  "comfortable",
  "comfort",
  "classy",
  "family",
  "budget",
  "daily",
  "spacious",
  "roomy",
  "all",
  "wheel",
  "drive",
  "awd",
  "4wd",
  "4x4",
  "fwd",
  "rwd",
]);

const MAX_PRICE_INTENT_PATTERN = /\b(?:under|below|max(?:imum)?|budget|less than|cheaper than|up to|upto)\b/i;
const MIN_PRICE_INTENT_PATTERN = /\b(?:above|over|from|min(?:imum)?|more than|starting at)\b/i;
const PRICE_RANGE_INTENT_PATTERN =
  /\b(?:between|range)\b|\bfrom\b.+\b(?:to|and|-)\b|\b\d[\d,.]*\s*(?:million|m|k)?\s*(?:-|to)\s*(?:ksh?|kes)?\s*\d[\d,.]*\s*(?:million|m|k)?\b/i;
const NEAR_ME_INTENT_PATTERN = /\b(?:near me|nearby|around me|close to me|my area|where i am)\b/i;

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findMakeMatches(value: string) {
  const padded = ` ${value} `;
  const matches: string[] = [];

  for (const [alias, normalized] of MAKE_ALIASES) {
    if (padded.includes(` ${alias} `) && !matches.includes(normalized)) {
      matches.push(normalized);
    }
  }

  return matches;
}

export function hasNearMeIntent(query: string) {
  return NEAR_ME_INTENT_PATTERN.test(query);
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

function joinMatches(matches: string[]) {
  return matches.length > 0 ? matches.join(",") : undefined;
}

function parsePrice(lower: string, direction: "min" | "max") {
  const matcher =
    direction === "max"
      ? /(?:under|below|max(?:imum)?|budget|less than|cheaper than|up to|upto)\s*(?:ksh?|kes)?\s*([\d,.]+)\s*(million|m|k)?/i
      : /(?:above|over|from|min(?:imum)?|more than|starting at)\s*(?:ksh?|kes)?\s*([\d,.]+)\s*(million|m|k)?/i;
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

function findIntentBodyTypes(value: string) {
  const padded = ` ${value} `;
  const matches: string[] = [];

  for (const [phrase, bodyTypes] of INTENT_BODY_TYPE_ALIASES) {
    if (padded.includes(` ${phrase} `)) {
      bodyTypes.forEach((bodyType) => {
        if (!matches.includes(bodyType)) {
          matches.push(bodyType);
        }
      });
    }
  }

  return matches;
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
    .replace(NEAR_ME_INTENT_PATTERN, " ")
    .replace(
      /(?:under|below|max(?:imum)?|budget|less than|cheaper than|up to|upto|above|over|from|min(?:imum)?|more than|starting at|in|with)\b.*$/i,
      " "
    )
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
  if (params.make && (params.model || params.bodyType || params.maxPrice || params.location || params.driveType)) {
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

  const makeMatches = findMakeMatches(lower);
  const make = joinMatches(makeMatches);
  const intents = detectVehicleIntents(lower);
  const origin = detectVehicleOrigin(lower);
  const useCase = detectVehicleUseCase(lower);
  const bodyTypeMatches = findAliasMatches(lower, BODY_TYPE_ALIASES);
  const intentBodyTypeMatches = findIntentBodyTypes(lower);
  const expandedBodyTypes = [...bodyTypeMatches];

  intentBodyTypeMatches.forEach((bodyType) => {
    if (!expandedBodyTypes.includes(bodyType)) {
      expandedBodyTypes.push(bodyType);
    }
  });

  if (bodyTypeMatches.includes("Crossover") && !expandedBodyTypes.includes("SUV")) {
    expandedBodyTypes.push("SUV");
  }

  if (bodyTypeMatches.includes("SUV") && lower.includes("crossover") && !expandedBodyTypes.includes("Crossover")) {
    expandedBodyTypes.push("Crossover");
  }

  const bodyType =
    expandedBodyTypes.length > 0 ? expandedBodyTypes.join(",") : undefined;
  const intent = intents.length > 0 ? intents.join(",") : undefined;
  const fuelType = joinMatches(findAliasMatches(lower, FUEL_TYPE_ALIASES));
  const transmission = joinMatches(findAliasMatches(lower, TRANSMISSION_ALIASES));
  const driveType = joinMatches(findAliasMatches(lower, DRIVE_TYPE_ALIASES));
  const location = joinMatches(findAliasMatches(lower, LOCATION_ALIASES));
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
    origin,
    useCase,
    intent,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    bodyType,
    transmission,
    fuelType,
    driveType,
    location,
    sellerType,
  };

  if (!make && !model && !origin && !useCase && !intent && !fuelType && !transmission && !driveType && !location && bodyType && maxPrice) {
    delete params.q;
  }

  if (Object.values(params).every((value) => !value) && !hasNearMeIntent(normalizedQuery)) {
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
  if (hasNearMeIntent(query) && !result.params.location) return false;

  const lower = query.toLowerCase();
  const intentWords = [
    "reliable",
    "family",
    "best",
    "cheap",
    "comfortable",
    "daily",
    "road trip",
    "small car",
    "compact car",
    "town car",
    "work car",
    "european",
    "german",
    "japanese",
    "first car",
    "executive",
    "fuel efficient",
    "classy",
    "traffic",
    "commute",
    "spacious",
    "roomy",
  ];
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
  assign("origin", input.origin);
  assign("useCase", input.useCase);
  assign("intent", input.intent);
  assign("minPrice", input.minPrice);
  assign("maxPrice", input.maxPrice);
  assign("minYear", input.minYear);
  assign("maxYear", input.maxYear);
  assign("bodyType", input.bodyType);
  assign("transmission", input.transmission);
  assign("fuelType", input.fuelType);
  assign("driveType", input.driveType);
  assign("location", input.location);
  assign("sellerType", input.sellerType);

  return params;
}

function hasMaxPriceIntent(query: string) {
  return MAX_PRICE_INTENT_PATTERN.test(query);
}

function hasMinPriceIntent(query: string) {
  return MIN_PRICE_INTENT_PATTERN.test(query);
}

function hasPriceRangeIntent(query: string) {
  return PRICE_RANGE_INTENT_PATTERN.test(query);
}

export function normalizeDirectionalBudgetParams(
  query: string,
  input: Partial<SmartSearchParams>
): SmartSearchParams {
  const params = sanitizeSmartSearchParams(input);
  const isRangeQuery = hasPriceRangeIntent(query);

  if (!isRangeQuery) {
    if (params.maxPrice && hasMaxPriceIntent(query)) {
      delete params.minPrice;
    }
    if (params.minPrice && hasMinPriceIntent(query)) {
      delete params.maxPrice;
    }
  }

  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  if (
    minPrice !== null &&
    maxPrice !== null &&
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    minPrice >= maxPrice &&
    !isRangeQuery
  ) {
    if (hasMaxPriceIntent(query)) {
      delete params.minPrice;
    } else if (hasMinPriceIntent(query)) {
      delete params.maxPrice;
    }
  }

  return params;
}

function hasStructuredSearchParams(params: SmartSearchParams) {
  return Object.entries(params).some(([key, value]) => key !== "q" && Boolean(value));
}

function shouldClearBudget(query: string) {
  return /\b(clear|remove|reset)\s+budget\b|\bany\s+budget\b|\bno\s+budget\b/i.test(query);
}

function shouldClearLocation(query: string) {
  return /\b(clear|remove|reset)\s+location\b|\bany\s+location\b|\bnationwide\b/i.test(query);
}

function shouldClearBodyType(query: string) {
  return /\b(clear|remove|reset)\s+body\s*type\b|\bany\s+body\s*type\b/i.test(query);
}

function shouldClearTransmission(query: string) {
  return /\b(clear|remove|reset)\s+transmission\b|\bany\s+transmission\b/i.test(query);
}

function shouldClearFuelType(query: string) {
  return /\b(clear|remove|reset)\s+fuel\b|\bany\s+fuel\b/i.test(query);
}

function shouldClearDriveType(query: string) {
  return /\b(clear|remove|reset)\s+drive(?:\s*type)?\b|\bany\s+drive(?:\s*type)?\b|\bany\s+drivetrain\b/i.test(query);
}

function shouldClearSellerType(query: string) {
  return /\b(clear|remove|reset)\s+seller\b|\bany\s+seller\b/i.test(query);
}

function shouldClearYear(query: string) {
  return /\b(clear|remove|reset)\s+year\b|\bany\s+year\b/i.test(query);
}

function shouldClearMake(query: string) {
  return /\b(clear|remove|reset)\s+make\b|\bany\s+make\b/i.test(query);
}

function shouldClearModel(query: string) {
  return /\b(clear|remove|reset)\s+model\b|\bany\s+model\b/i.test(query);
}

function shouldClearIntent(query: string) {
  return /\b(clear|remove|reset)\s+intent\b|\bclear\s+(comfort|reliability|road trip|daily|value|spacious)\b/i.test(query);
}

function shouldExcludeCurrentLocation(query: string, currentLocation?: string) {
  if (!currentLocation) return false;
  return new RegExp(`\\b(?:not|exclude|without)\\s+${currentLocation}\\b`, "i").test(query);
}

function mergeCsvValues(currentValue?: string, nextValue?: string) {
  const merged = [...(currentValue || "").split(","), ...(nextValue || "").split(",")]
    .map((value) => value.trim())
    .filter(Boolean);

  return merged.length > 0 ? Array.from(new Set(merged)).join(",") : undefined;
}

function countPopulatedParams(params: SmartSearchParams) {
  return Object.values(params).filter(Boolean).length;
}

function isStandaloneCatalogueTurn(query: string, nextParams: SmartSearchParams) {
  const normalized = compactWhitespace(query).toLowerCase();
  if (!normalized) return false;
  if (nextParams.location && countPopulatedParams(nextParams) === 1) return false;
  if (/\b(actually|only|also|with|in|under|below|over|from|more than|less than|remove|clear|not|exclude)\b/i.test(query)) {
    return false;
  }

  const catalogueKeys: (keyof SmartSearchParams)[] = [
    "make",
    "model",
    "origin",
    "bodyType",
    "transmission",
    "fuelType",
    "driveType",
    "sellerType",
  ];
  const populatedKeys = (Object.keys(nextParams) as (keyof SmartSearchParams)[]).filter((key) =>
    Boolean(nextParams[key])
  );

  return populatedKeys.length > 0 && populatedKeys.every((key) => catalogueKeys.includes(key));
}

export function applyAssistantSearchTurn(
  currentParams: SmartSearchParams | undefined,
  turnQuery: string,
  nextParams: SmartSearchParams
) {
  const query = turnQuery.trim();
  const excludedCurrentLocation = shouldExcludeCurrentLocation(query, currentParams?.location);
  const sanitizedNextParams = normalizeDirectionalBudgetParams(query, nextParams);
  const shouldReplaceContext = isStandaloneCatalogueTurn(query, sanitizedNextParams);
  const merged: SmartSearchParams = shouldReplaceContext ? {} : { ...(currentParams || {}) };

  if (shouldClearBudget(query) || sanitizedNextParams.minPrice || sanitizedNextParams.maxPrice) {
    delete merged.minPrice;
    delete merged.maxPrice;
  }
  if (shouldClearLocation(query) || excludedCurrentLocation) {
    delete merged.location;
  }
  if (shouldClearBodyType(query)) {
    delete merged.bodyType;
  }
  if (shouldClearTransmission(query)) {
    delete merged.transmission;
  }
  if (shouldClearFuelType(query)) {
    delete merged.fuelType;
  }
  if (shouldClearDriveType(query)) {
    delete merged.driveType;
  }
  if (shouldClearSellerType(query)) {
    delete merged.sellerType;
  }
  if (shouldClearYear(query)) {
    delete merged.minYear;
    delete merged.maxYear;
  }
  if (shouldClearMake(query)) {
    delete merged.make;
    delete merged.model;
    delete merged.origin;
  }
  if (shouldClearModel(query)) {
    delete merged.model;
  }
  if (shouldClearIntent(query)) {
    delete merged.intent;
  }

  const currentMake = merged.make;
  const currentModel = merged.model;
  const currentOrigin = merged.origin;

  if (sanitizedNextParams.make && currentMake && sanitizedNextParams.make !== currentMake) {
    delete merged.model;
  }
  if (sanitizedNextParams.origin && currentOrigin && sanitizedNextParams.origin !== currentOrigin) {
    delete merged.make;
    delete merged.model;
  }
  if (sanitizedNextParams.make) {
    delete merged.origin;
  }
  if (sanitizedNextParams.model && currentModel && sanitizedNextParams.model !== currentModel && !sanitizedNextParams.make) {
    delete merged.q;
  }
  if (sanitizedNextParams.intent) {
    delete merged.q;
  }
  if (sanitizedNextParams.bodyType) {
    delete merged.q;
  }
  if (sanitizedNextParams.location) {
    if (!excludedCurrentLocation || sanitizedNextParams.location !== currentParams?.location) {
      delete merged.location;
    } else {
      delete sanitizedNextParams.location;
    }
  }
  if (sanitizedNextParams.driveType) {
    delete merged.q;
  }
  if (sanitizedNextParams.intent) {
    sanitizedNextParams.intent = mergeCsvValues(merged.intent, sanitizedNextParams.intent);
  }

  const combined = normalizeDirectionalBudgetParams(query, {
    ...merged,
    ...sanitizedNextParams,
  });

  if (hasStructuredSearchParams(combined)) {
    delete combined.q;
  }

  if (!Object.values(combined).some(Boolean) && !hasNearMeIntent(query)) {
    combined.q = compactWhitespace(query);
  }

  return combined;
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
    make: parseMaybeArray(params.make),
    model: parseMaybeArray(params.model),
    origin: params.origin,
    useCase: params.useCase,
    intent: parseMaybeArray(params.intent),
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minYear: params.minYear ? Number(params.minYear) : undefined,
    maxYear: params.maxYear ? Number(params.maxYear) : undefined,
    bodyType: parseMaybeArray(params.bodyType),
    transmission: parseMaybeArray(params.transmission),
    fuelType: parseMaybeArray(params.fuelType),
    driveType: parseMaybeArray(params.driveType),
    location: parseMaybeArray(params.location),
    sellerType: params.sellerType,
  };
}
