import {
  LISTING_ALERT_CATEGORY_CONFIG,
  LISTING_ALERT_PRICE_OPTIONS,
  type ListingAlertCriterionKey,
  type ListingAlertPriceRange,
} from "@/lib/constants/listing-alerts";
import {
  LISTING_CATEGORY_OPTIONS,
  type ListingCategory,
} from "@/lib/constants/marketplace";
import type {
  ListingAlertCriteria,
  ListingAlertMatchType,
} from "@/lib/types/listing-alerts";
import type { ValidatedListingAlertInput } from "@/lib/validations/listing-alert";

export type MatchableListingAlert = {
  id: string;
  userId: string;
  category: ListingCategory;
  make: string | null;
  model: string | null;
  location: string | null;
  minYear: number | null;
  maxYear: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  criteria: ListingAlertCriteria;
  emailEnabled: boolean;
  priceDropEnabled: boolean;
};

export type ListingAlertMatchableListing = {
  id: string;
  status: string;
  sale_channel?: string | null;
  make: string;
  model: string;
  year: number;
  price: number;
  body_type: string | null;
  fuel_type: string | null;
  seats: number | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
};

const CATEGORY_VALUES = new Set<ListingCategory>(
  LISTING_CATEGORY_OPTIONS.map(({ value }) => value)
);

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ");
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getMetadataValues(listing: ListingAlertMatchableListing, ...keys: string[]) {
  const metadata = toRecord(listing.metadata);
  const details = toRecord(metadata.details);

  return keys
    .flatMap((key) => [metadata[key], details[key]])
    .filter((value): value is string | number =>
      typeof value === "string" || typeof value === "number"
    );
}

function firstFiniteNumber(values: unknown[]) {
  for (const raw of values) {
    const match = String(raw ?? "")
      .replace(/,/g, "")
      .match(/(\d+(?:\.\d+)?)/);
    if (!match) continue;
    const value = Number(match[1]);
    if (!Number.isFinite(value)) continue;
    return value;
  }
  return null;
}

function firstEngineCc(values: unknown[]) {
  for (const raw of values) {
    const value = firstFiniteNumber([raw]);
    if (value === null) continue;
    return /\bl\b|litre|liter/i.test(String(raw)) || value < 20 ? value * 1000 : value;
  }
  return null;
}

function textMatches(actualValues: unknown[], expected: unknown) {
  const normalizedExpected = normalizeText(expected);
  if (!normalizedExpected) return true;
  return actualValues.some((actual) => {
    const normalizedActual = normalizeText(actual);
    if (!normalizedActual) return false;
    return (
      normalizedActual === normalizedExpected ||
      normalizedActual.includes(normalizedExpected) ||
      normalizedExpected.includes(normalizedActual)
    );
  });
}

export function getListingAlertCategory(listing: ListingAlertMatchableListing): ListingCategory {
  const metadataCategory = normalizeText(getMetadataValues(listing, "category")[0]);
  if (CATEGORY_VALUES.has(metadataCategory as ListingCategory)) {
    return metadataCategory as ListingCategory;
  }

  const bodyType = normalizeText(listing.body_type);
  if (/\b(van|minibus|panel van|pickup)\b/.test(bodyType)) return "van";
  if (/\b(truck|tractor unit|rigid|trailer)\b/.test(bodyType)) return "truck";

  const searchText = normalizeText([
    listing.make,
    listing.model,
    listing.body_type,
    listing.description,
    ...getMetadataValues(
      listing,
      "vehicleType",
      "equipmentType",
      "taxonomyCategory",
      "subcategory"
    ),
  ].join(" "));

  if (/\b(motorbike|motorcycle|scooter|moped|quad|sport bike)\b/.test(searchText)) {
    return "motorbike";
  }
  if (/\b(truck|tractor unit|rigid truck|tipper|trailer)\b/.test(searchText)) {
    return "truck";
  }
  if (/\b(excavator|bulldozer|loader|forklift|grader|construction|plant equipment)\b/.test(searchText)) {
    return "plant_construction";
  }
  if (/\b(tractor|harvester|plough|plow|baler|cultivator|farm|agricultural)\b/.test(searchText)) {
    return "farm_agricultural";
  }
  if (/\b(van|minibus|panel van|pickup)\b/.test(searchText)) return "van";
  return "car";
}

function parseEngineRange(value: string) {
  const match = value.match(/^(\d+)\s*-\s*(\d*)$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = match[2] ? Number(match[2]) : null;
  return Number.isFinite(min) ? { min, max } : null;
}

function criterionMatches(
  listing: ListingAlertMatchableListing,
  key: ListingAlertCriterionKey,
  expected: string | number
) {
  switch (key) {
    case "bodyType":
      return textMatches(
        [
          listing.body_type,
          ...getMetadataValues(listing, "bodyType", "body_type", "bikeType", "vanType"),
        ],
        expected
      );
    case "fuelType":
      return textMatches(
        [listing.fuel_type, ...getMetadataValues(listing, "fuelType", "fuel_type")],
        expected
      );
    case "seats": {
      const actual = firstFiniteNumber([
        listing.seats,
        ...getMetadataValues(listing, "seats"),
      ]);
      return actual !== null && actual === Number(expected);
    }
    case "engineCc": {
      const range = parseEngineRange(String(expected));
      const actual = firstEngineCc(
        getMetadataValues(
          listing,
          "engineCapacity",
          "engine_capacity",
          "engineDisplacement",
          "engine_size"
        )
      );
      if (!range || actual === null || actual < range.min) return false;
      return range.max === null || actual <= range.max;
    }
    case "taxonomyCategory":
      return textMatches(
        [listing.body_type, ...getMetadataValues(listing, "taxonomyCategory", "taxonomy_category")],
        expected
      );
    case "axleConfig":
      return textMatches(
        getMetadataValues(listing, "axleConfig", "axleConfiguration"),
        expected
      );
    case "equipmentType":
      return textMatches(
        [
          listing.model,
          listing.body_type,
          ...getMetadataValues(
            listing,
            "equipmentType",
            "equipment_type",
            "taxonomyCategory",
            "subcategory"
          ),
        ],
        expected
      );
    case "hoursMax": {
      const actual = firstFiniteNumber(
        getMetadataValues(listing, "hours_used", "hoursUsed", "operatingHours")
      );
      return actual !== null && actual <= Number(expected);
    }
  }
}

export function getListingAlertPriceBounds(priceRange: ListingAlertPriceRange) {
  const option = LISTING_ALERT_PRICE_OPTIONS.find(({ value }) => value === priceRange);
  return {
    minPrice: option?.min ?? null,
    maxPrice: option?.max ?? null,
  };
}

export function getListingAlertPriceRange(
  minPrice: number | null,
  maxPrice: number | null
): ListingAlertPriceRange {
  return (
    LISTING_ALERT_PRICE_OPTIONS.find(
      (option) => option.min === minPrice && option.max === maxPrice
    )?.value ?? "any"
  );
}

export function buildListingAlertCriteria(
  category: ListingCategory,
  primaryValue?: string,
  secondaryValue?: string
): ListingAlertCriteria {
  const fields = LISTING_ALERT_CATEGORY_CONFIG[category].fields;
  const criteria: ListingAlertCriteria = {};

  [primaryValue, secondaryValue].forEach((rawValue, index) => {
    const field = fields[index];
    const value = rawValue?.trim();
    if (!field || !value || value === "any") return;
    if (!field.options.some((option) => option.value === value)) return;

    criteria[field.key] =
      field.key === "seats" || field.key === "hoursMax" ? Number(value) : value;
  });

  return criteria;
}

export function getListingAlertCriterionValue(
  criteria: ListingAlertCriteria,
  key: ListingAlertCriterionKey
) {
  const value = criteria[key];
  return value === undefined ? "any" : String(value);
}

export function buildListingAlertLabel(input: ValidatedListingAlertInput) {
  const categoryLabel =
    LISTING_CATEGORY_OPTIONS.find(({ value }) => value === input.category)?.label ?? "Listings";
  const subject = [input.make, input.model].filter(Boolean).join(" ") || categoryLabel;
  return input.location ? `${subject} in ${input.location}`.slice(0, 120) : subject.slice(0, 120);
}

export function listingMatchesAlert(
  listing: ListingAlertMatchableListing,
  alert: MatchableListingAlert,
  matchType: ListingAlertMatchType
) {
  if (listing.status !== "active" || listing.sale_channel === "dealer_only") return false;
  if (matchType === "price_drop" && !alert.priceDropEnabled) return false;
  if (getListingAlertCategory(listing) !== alert.category) return false;
  if (!textMatches([listing.make], alert.make)) return false;
  if (!textMatches([listing.model], alert.model)) return false;

  if (
    !textMatches(
      getMetadataValues(listing, "country", "cityTown", "locationArea", "location"),
      alert.location
    )
  ) {
    return false;
  }

  if (alert.minYear !== null && listing.year < alert.minYear) return false;
  if (alert.maxYear !== null && listing.year > alert.maxYear) return false;
  if (alert.minPrice !== null && listing.price < alert.minPrice) return false;
  if (alert.maxPrice !== null && listing.price > alert.maxPrice) return false;

  return Object.entries(alert.criteria).every(([key, expected]) =>
    expected === undefined
      ? true
      : criterionMatches(listing, key as ListingAlertCriterionKey, expected)
  );
}
