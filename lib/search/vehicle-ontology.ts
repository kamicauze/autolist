import type { Listing } from "@/lib/types/listing";

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

function padded(value: string) {
  return ` ${value.trim().toLowerCase()} `;
}

function listingText(listing: Listing) {
  return [
    listing.make,
    listing.model,
    listing.body_type,
    listing.description,
    listing.features?.join(" "),
  ]
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

export function detectVehicleOrigin(query: string): SearchOrigin | undefined {
  return detectLatestAlias(query, ORIGIN_ALIASES);
}

export function detectVehicleUseCase(query: string): SearchUseCase | undefined {
  return detectLatestAlias(query, USE_CASE_ALIASES);
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

export function getMinimumUseCaseScore(useCase?: string | null) {
  if (!useCase || !(SEARCH_USE_CASES as readonly string[]).includes(useCase)) {
    return 1;
  }

  return MINIMUM_SCORE_BY_USE_CASE[useCase as SearchUseCase] || 1;
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
