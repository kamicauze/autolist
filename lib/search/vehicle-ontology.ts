import type { Listing } from "@/lib/types/listing";
import { getListingMetadataString } from "@/lib/utils/listing-details";

export const SEARCH_ORIGINS = [
  "European",
  "German",
  "Japanese",
  "Korean",
  "British",
  "American",
] as const;

export type SearchOrigin = (typeof SEARCH_ORIGINS)[number];

export const SEARCH_USE_CASES = [
  "first_car",
  "family",
  "executive",
  "work",
  "offroad",
  "fuel_efficient",
] as const;

export type SearchUseCase = (typeof SEARCH_USE_CASES)[number];

export const SEARCH_INTENTS = [
  "reliable",
  "comfortable",
  "daily_driver",
  "road_trip",
  "value",
  "spacious",
] as const;

export type SearchIntent = (typeof SEARCH_INTENTS)[number];

export const SEARCH_DRIVE_TYPES = ["FWD", "RWD", "AWD", "4WD"] as const;

export type SearchDriveType = (typeof SEARCH_DRIVE_TYPES)[number];

const ORIGIN_ALIASES: ReadonlyArray<readonly [string, SearchOrigin]> = [
  ["european", "European"],
  ["german", "German"],
  ["japanese", "Japanese"],
  ["korean", "Korean"],
  ["british", "British"],
  ["american", "American"],
];

const USE_CASE_ALIASES: ReadonlyArray<readonly [string, SearchUseCase]> = [
  ["first car", "first_car"],
  ["starter car", "first_car"],
  ["beginner car", "first_car"],
  ["family car", "family"],
  ["family suv", "family"],
  ["car for a family", "family"],
  ["executive", "executive"],
  ["premium", "executive"],
  ["luxury", "executive"],
  ["classy", "executive"],
  ["work car", "work"],
  ["work vehicle", "work"],
  ["commercial", "work"],
  ["business use", "work"],
  ["off-road", "offroad"],
  ["offroad", "offroad"],
  ["rough road", "offroad"],
  ["upcountry", "offroad"],
  ["fuel efficient", "fuel_efficient"],
  ["economical", "fuel_efficient"],
  ["cheap to run", "fuel_efficient"],
  ["low fuel consumption", "fuel_efficient"],
  ["good mileage", "fuel_efficient"],
];

const INTENT_ALIASES: ReadonlyArray<readonly [string, SearchIntent]> = [
  ["reliable", "reliable"],
  ["dependable", "reliable"],
  ["durable", "reliable"],
  ["comfortable", "comfortable"],
  ["comfort", "comfortable"],
  ["smooth ride", "comfortable"],
  ["daily driver", "daily_driver"],
  ["daily use", "daily_driver"],
  ["commute", "daily_driver"],
  ["commuter", "daily_driver"],
  ["traffic", "daily_driver"],
  ["everyday", "daily_driver"],
  ["road trip", "road_trip"],
  ["long distance", "road_trip"],
  ["highway", "road_trip"],
  ["upcountry trip", "road_trip"],
  ["value", "value"],
  ["good value", "value"],
  ["budget friendly", "value"],
  ["affordable", "value"],
  ["not too expensive", "value"],
  ["cheap", "value"],
  ["spacious", "spacious"],
  ["roomy", "spacious"],
  ["7 seater", "spacious"],
  ["seven seater", "spacious"],
];

const ORIGIN_MAKES: Record<SearchOrigin, string[]> = {
  European: [
    "Audi",
    "BMW",
    "Citroen",
    "Cupra",
    "Dacia",
    "Fiat",
    "Jaguar",
    "Land Rover",
    "Mercedes-Benz",
    "Mercedes Benz",
    "Mercedez Benz",
    "Mini",
    "Opel",
    "Peugeot",
    "Porsche",
    "Renault",
    "SEAT",
    "Skoda",
    "Smart",
    "Volkswagen",
    "VW",
    "Volvo",
  ],
  German: [
    "Audi",
    "BMW",
    "Mercedes-Benz",
    "Mercedes Benz",
    "Mercedez Benz",
    "Mini",
    "Opel",
    "Porsche",
    "Smart",
    "Volkswagen",
    "VW",
  ],
  Japanese: [
    "Daihatsu",
    "Honda",
    "Isuzu",
    "Lexus",
    "Mazda",
    "Mitsubishi",
    "Nissan",
    "Subaru",
    "Suzuki",
    "Toyota",
  ],
  Korean: ["Hyundai", "Kia"],
  British: ["Jaguar", "Land Rover", "Mini"],
  American: ["Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "Jeep", "Tesla"],
};

const DEFAULT_BODY_TYPES_BY_USE_CASE: Record<SearchUseCase, string[]> = {
  first_car: ["Hatchback", "Sedan"],
  family: ["Sedan", "SUV", "Wagon"],
  executive: ["Sedan", "SUV"],
  work: ["Pickup", "Van", "Truck", "Wagon"],
  offroad: ["SUV", "Pickup", "Truck"],
  fuel_efficient: ["Hatchback", "Sedan", "Crossover"],
};

const MINIMUM_SCORE_BY_USE_CASE: Record<SearchUseCase, number> = {
  first_car: 4,
  family: 3,
  executive: 4,
  work: 4,
  offroad: 4,
  fuel_efficient: 3,
};

const SMALL_CAR_MODELS = [
  "demio",
  "fit",
  "polo",
  "swift",
  "passo",
  "vitz",
  "march",
  "note",
  "yaris",
  "aqua",
];

const FAMILY_MODELS = [
  "cx-5",
  "cx5",
  "forester",
  "harrier",
  "prado",
  "x-trail",
  "xtrail",
  "sorento",
  "sportage",
  "premio",
  "fielder",
  "outback",
  "alphard",
];

const EXECUTIVE_MAKES = ["Audi", "BMW", "Jaguar", "Land Rover", "Lexus", "Mercedes-Benz", "Porsche", "Volvo"];
const WORK_MODELS = ["probox", "hiace", "hilux", "canter", "d-max", "dmax", "ranger", "navara"];
const OFFROAD_MODELS = ["prado", "land cruiser", "pajero", "forester", "x-trail", "xtrail", "hilux", "range rover"];
const FUEL_EFFICIENT_MODELS = ["aqua", "demio", "fit", "note", "passo", "polo", "prius", "swift", "vitz", "yaris"];
const RELIABLE_MAKES = ["Honda", "Hyundai", "Kia", "Lexus", "Mazda", "Subaru", "Suzuki", "Toyota"];
const RELIABLE_MODELS = ["axio", "corolla", "demio", "fielder", "fit", "forester", "impreza", "outback", "passo", "premio", "swift", "vitz", "yaris"];
const COMFORT_FEATURES = ["360 camera", "adaptive cruise", "armrest", "climate control", "cruise control", "dual zone", "heated seat", "leather", "memory seat", "premium audio", "sunroof"];
const ROAD_TRIP_MODELS = ["alphard", "cx-5", "cx5", "cx-8", "fortuner", "harrier", "land cruiser", "outback", "prado", "sorento", "x-trail", "xtrail"];
const SPACIOUS_MODELS = ["alphard", "cx-8", "highlander", "outback", "prado", "serena", "sienta", "sorento", "voxy"];

const DRIVE_TYPE_PATTERNS: Record<SearchDriveType, RegExp[]> = {
  FWD: [/\bfwd\b/, /\bfront[-\s]?wheel drive\b/],
  RWD: [/\brwd\b/, /\brear[-\s]?wheel drive\b/],
  AWD: [
    /\bawd\b/,
    /\ball[-\s]?wheel drive\b/,
    /\bsymmetrical awd\b/,
    /\bquattro\b/,
    /\bx[-\s]?drive\b/,
    /\b4matic\b/,
    /\bs[-\s]?awc\b/,
  ],
  "4WD": [
    /\b4wd\b/,
    /\b4x4\b/,
    /\bfour[-\s]?wheel drive\b/,
    /\bfour by four\b/,
  ],
};

const AWD_MODEL_PATTERNS = [
  /\bwrx\b/,
  /\bwrx s4\b/,
  /\bforester\b/,
  /\boutback\b/,
  /\blegacy\b/,
  /\blevorg\b/,
  /\bimpreza\b/,
  /\bcrosstrek\b/,
  /\bxv\b/,
];

const FOUR_WHEEL_DRIVE_MODEL_PATTERNS = [
  /\bland cruiser\b/,
  /\bprado\b/,
  /\bpajero\b/,
  /\bshogun\b/,
  /\bwrangler\b/,
  /\bdefender\b/,
  /\bdiscovery\b/,
  /\brange rover\b/,
  /\bjimny\b/,
  /\bhilux\b/,
  /\bx[-\s]?trail\b/,
];

function padded(value: string) {
  return ` ${value.trim().toLowerCase()} `;
}

function listingText(listing: Listing) {
  return [
    listing.make,
    listing.model,
    listing.body_type,
    listing.drive_type,
    getListingMetadataString(listing, "trim"),
    getListingMetadataString(listing, "variant"),
    getListingMetadataString(listing, "driveType"),
    getListingMetadataString(listing, "drive_type"),
    getListingMetadataString(listing, "drivetrain"),
    listing.description,
    listing.features?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function listingModelText(listing: Listing) {
  return [listing.make, listing.model, getListingMetadataString(listing, "trim"), getListingMetadataString(listing, "variant")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function textContainsAny(text: string, terms: string[]) {
  const haystack = padded(text);
  return terms.some((term) => haystack.includes(` ${term.toLowerCase()} `));
}

function detectLatestAlias<TValue extends string>(
  query: string,
  aliases: ReadonlyArray<readonly [string, TValue]>
): TValue | undefined {
  const normalized = padded(query);
  let latestMatch: { index: number; value: TValue } | null = null;

  for (const [phrase, value] of aliases) {
    const index = normalized.lastIndexOf(` ${phrase} `);
    if (index === -1) continue;
    if (!latestMatch || index > latestMatch.index) {
      latestMatch = { index, value };
    }
  }

  return latestMatch?.value;
}

function detectAliasMatches<TValue extends string>(
  query: string,
  aliases: ReadonlyArray<readonly [string, TValue]>
) {
  const normalized = padded(query);
  const matches: TValue[] = [];

  for (const [phrase, value] of aliases) {
    if (normalized.includes(` ${phrase} `) && !matches.includes(value)) {
      matches.push(value);
    }
  }

  return matches;
}

export function detectVehicleOrigin(query: string): SearchOrigin | undefined {
  return detectLatestAlias(query, ORIGIN_ALIASES);
}

export function detectVehicleUseCase(query: string): SearchUseCase | undefined {
  return detectLatestAlias(query, USE_CASE_ALIASES);
}

export function detectVehicleIntents(query: string) {
  return detectAliasMatches(query, INTENT_ALIASES);
}

export function normalizeDriveTypeValue(value?: string | null): SearchDriveType | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  for (const driveType of SEARCH_DRIVE_TYPES) {
    if (DRIVE_TYPE_PATTERNS[driveType].some((pattern) => pattern.test(normalized))) {
      return driveType;
    }
  }

  return null;
}

export function inferListingDriveTypes(listing: Listing): SearchDriveType[] {
  const text = listingText(listing);
  const modelText = listingModelText(listing);
  const inferred = new Set<SearchDriveType>();

  for (const driveType of SEARCH_DRIVE_TYPES) {
    if (DRIVE_TYPE_PATTERNS[driveType].some((pattern) => pattern.test(text))) {
      inferred.add(driveType);
    }
  }

  const make = listing.make.trim().toLowerCase();
  const model = listing.model.trim().toLowerCase();
  const isSubaruAwdModel =
    make === "subaru" &&
    !/\bbrz\b/.test(modelText) &&
    (AWD_MODEL_PATTERNS.some((pattern) => pattern.test(modelText)) || model.length > 0);

  if (isSubaruAwdModel || AWD_MODEL_PATTERNS.some((pattern) => pattern.test(modelText))) {
    inferred.add("AWD");
  }

  if (FOUR_WHEEL_DRIVE_MODEL_PATTERNS.some((pattern) => pattern.test(modelText))) {
    inferred.add("4WD");
  }

  return Array.from(inferred);
}

export function getMakesForOrigin(origin?: string | null) {
  if (!origin || !(origin in ORIGIN_MAKES)) return [];
  return ORIGIN_MAKES[origin as SearchOrigin];
}

export function getDefaultBodyTypesForUseCase(useCase?: string | null) {
  if (!useCase || !(useCase in DEFAULT_BODY_TYPES_BY_USE_CASE)) return [];
  return DEFAULT_BODY_TYPES_BY_USE_CASE[useCase as SearchUseCase];
}

export function getOriginForMake(make: string): SearchOrigin | null {
  return (
    SEARCH_ORIGINS.find((origin) => ORIGIN_MAKES[origin].includes(make)) || null
  );
}

export function getUseCaseScore(listing: Listing, useCase?: string | null) {
  if (!useCase || !(SEARCH_USE_CASES as readonly string[]).includes(useCase)) {
    return 0;
  }

  const scoreTarget = useCase as SearchUseCase;
  const text = listingText(listing);
  const model = listing.model.toLowerCase();
  const make = listing.make;
  const bodyType = listing.body_type?.toLowerCase() || "";
  const price = Number(listing.price) || 0;
  let score = 0;

  switch (scoreTarget) {
    case "first_car":
      if (bodyType.includes("hatchback")) score += 4;
      if (bodyType.includes("sedan")) score += 2;
      if (textContainsAny(model, SMALL_CAR_MODELS)) score += 5;
      if (price > 0 && price <= 2_500_000) score += 2;
      break;
    case "family":
      if (["sedan", "suv", "wagon"].some((type) => bodyType.includes(type))) score += 3;
      if ((listing.seats || 0) >= 5) score += 2;
      if (textContainsAny(text, FAMILY_MODELS)) score += 4;
      break;
    case "executive":
      if (EXECUTIVE_MAKES.includes(make)) score += 5;
      if (["sedan", "suv"].some((type) => bodyType.includes(type))) score += 2;
      if (price >= 2_500_000) score += 1;
      break;
    case "work":
      if (["pickup", "van", "truck"].some((type) => bodyType.includes(type))) score += 5;
      if (textContainsAny(text, WORK_MODELS)) score += 4;
      break;
    case "offroad":
      if (["suv", "pickup", "truck"].some((type) => bodyType.includes(type))) score += 4;
      if (textContainsAny(text, OFFROAD_MODELS)) score += 4;
      if (text.includes("4wd") || text.includes("awd")) score += 2;
      break;
    case "fuel_efficient":
      if ((listing.fuel_type || "").toLowerCase().includes("hybrid")) score += 4;
      if ((listing.fuel_type || "").toLowerCase().includes("electric")) score += 4;
      if (textContainsAny(text, FUEL_EFFICIENT_MODELS)) score += 4;
      if (text.includes("1300cc") || text.includes("1500cc")) score += 1;
      break;
  }

  return score;
}

export function getIntentScore(listing: Listing, intent?: string | null) {
  if (!intent || !(SEARCH_INTENTS as readonly string[]).includes(intent)) {
    return 0;
  }

  const scoreTarget = intent as SearchIntent;
  const text = listingText(listing);
  const model = listing.model.toLowerCase();
  const make = listing.make;
  const bodyType = listing.body_type?.toLowerCase() || "";
  const price = Number(listing.price) || 0;
  const seats = listing.seats || 0;
  const transmission = (listing.transmission || "").toLowerCase();
  const fuelType = (listing.fuel_type || "").toLowerCase();
  let score = 0;

  switch (scoreTarget) {
    case "reliable":
      if (RELIABLE_MAKES.includes(make)) score += 4;
      if (textContainsAny(model, RELIABLE_MODELS)) score += 4;
      if (price > 0 && price <= 4_000_000) score += 1;
      break;
    case "comfortable":
      if (["sedan", "suv", "wagon", "van"].some((type) => bodyType.includes(type))) score += 2;
      if (EXECUTIVE_MAKES.includes(make)) score += 2;
      if (textContainsAny(text, COMFORT_FEATURES)) score += 3;
      if (seats >= 5) score += 1;
      break;
    case "daily_driver":
      if (["automatic", "cvt"].some((type) => transmission.includes(type))) score += 3;
      if (["hatchback", "sedan", "crossover", "suv"].some((type) => bodyType.includes(type))) score += 2;
      if (textContainsAny(text, FUEL_EFFICIENT_MODELS) || fuelType.includes("hybrid")) score += 2;
      if (price > 0 && price <= 3_000_000) score += 1;
      break;
    case "road_trip":
      if (["suv", "wagon", "van", "pickup"].some((type) => bodyType.includes(type))) score += 3;
      if (bodyType.includes("sedan")) score += 1;
      if (textContainsAny(text, ROAD_TRIP_MODELS)) score += 3;
      if (fuelType.includes("diesel")) score += 1;
      if (seats >= 5) score += 1;
      break;
    case "value":
      if (price > 0 && price <= 2_500_000) score += 3;
      else if (price > 0 && price <= 4_000_000) score += 1;
      if (["Toyota", "Honda", "Mazda", "Suzuki", "Hyundai", "Kia", "Nissan"].includes(make)) score += 2;
      if (["hatchback", "sedan", "crossover"].some((type) => bodyType.includes(type))) score += 1;
      if (textContainsAny(text, FUEL_EFFICIENT_MODELS)) score += 1;
      break;
    case "spacious":
      if (seats >= 7) score += 4;
      else if (seats >= 5) score += 2;
      if (["suv", "wagon", "van"].some((type) => bodyType.includes(type))) score += 2;
      if (textContainsAny(text, SPACIOUS_MODELS)) score += 3;
      break;
  }

  return score;
}

export function getMinimumUseCaseScore(useCase?: string | null) {
  if (!useCase || !(SEARCH_USE_CASES as readonly string[]).includes(useCase)) {
    return 1;
  }

  return MINIMUM_SCORE_BY_USE_CASE[useCase as SearchUseCase] || 1;
}

export function describeIntent(intent?: string | null) {
  if (!intent) return null;

  const labels: Record<SearchIntent, string> = {
    reliable: "reliability",
    comfortable: "comfort",
    daily_driver: "daily-driving fit",
    road_trip: "road-trip readiness",
    value: "value-conscious picks",
    spacious: "space and seating",
  };

  return labels[intent as SearchIntent] || null;
}

export function describeOrigin(origin?: string | null) {
  if (!origin) return null;
  return `${origin} brands`;
}

export function describeUseCase(useCase?: string | null) {
  if (!useCase) return null;

  const labels: Record<SearchUseCase, string> = {
    first_car: "first-car friendly options",
    family: "family-friendly vehicles",
    executive: "executive or premium vehicles",
    work: "work-ready vehicles",
    offroad: "off-road capable vehicles",
    fuel_efficient: "fuel-efficient vehicles",
  };

  return labels[useCase as SearchUseCase] || null;
}
