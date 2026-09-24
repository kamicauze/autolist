import { LISTING_CATEGORY_OPTIONS, type ListingCategory } from "@/lib/constants/marketplace";
import type { SearchListingFilters } from "@/lib/data/listings";
import { parseFiniteSearchNumber } from "@/lib/search/search-filter-params";

export type RawSearchParams =
  | URLSearchParams
  | { [key: string]: string | string[] | undefined };

function toRecord(params: RawSearchParams): { [key: string]: string | string[] | undefined } {
  if (!(params instanceof URLSearchParams)) return params;

  const record: { [key: string]: string | string[] } = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    record[key] = values.length > 1 ? values : values[0];
  }
  return record;
}

export function parseSearchCategory(
  value: string | string[] | undefined
): ListingCategory | undefined {
  const scalar = Array.isArray(value) ? value[0] : value;
  if (!scalar) return undefined;

  return LISTING_CATEGORY_OPTIONS.some((item) => item.value === scalar)
    ? (scalar as ListingCategory)
    : undefined;
}

/** Single source of truth for search URL params -> filters, shared by /search and /api/listings/count. */
export function parseSearchListingFilters(input: RawSearchParams): SearchListingFilters {
  const params = toRecord(input);
  const category = parseSearchCategory(params.category);
  const isTruckSearch = category === "truck";

  const scalar = (value: string | string[] | undefined): string | undefined =>
    (Array.isArray(value) ? value[0] : value) || undefined;
  const array = (value: string | string[] | undefined): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  };
  const number = (value: string | string[] | undefined): number | undefined => {
    const raw = scalar(value);
    return raw ? Number(raw) : undefined;
  };

  return {
    q: scalar(params.q),
    category,
    make: scalar(params.make),
    model: scalar(params.model),
    origin: scalar(params.origin),
    equipmentType: array(params.equipmentType),
    useCase: scalar(params.useCase),
    intent: array(params.intent),
    minPrice: number(params.minPrice),
    maxPrice: number(params.maxPrice),
    minYear: number(params.minYear),
    maxYear: number(params.maxYear),
    bodyType: array(params.bodyType),
    transmission: array(params.transmission),
    fuelType: array(params.fuelType),
    condition: scalar(params.condition) as SearchListingFilters["condition"],
    location: scalar(params.location),
    color: scalar(params.color),
    seats: number(params.seats),
    doors: number(params.doors),
    driveType: scalar(params.driveType),
    sellerType: scalar(params.sellerType) as SearchListingFilters["sellerType"],
    verifiedOnly: scalar(params.verifiedOnly) === "true",
    featured: scalar(params.featured) === "true",
    minMileage: number(params.minMileage),
    maxMileage: number(params.maxMileage),
    engineCc: scalar(params.engineCc),
    taxonomyCategory: scalar(params.taxCategory),
    taxonomySubcategory: scalar(params.taxSubcategory),
    minHours: number(params.hoursMin),
    maxHours: number(params.hoursMax),
    axleConfig: isTruckSearch ? scalar(params.axleConfig) : undefined,
    cabType: isTruckSearch ? scalar(params.cabType) : undefined,
    minGvmKg: isTruckSearch ? parseFiniteSearchNumber(params.gvmMin) : undefined,
    maxGvmKg: isTruckSearch ? parseFiniteSearchNumber(params.gvmMax) : undefined,
    minEnginePowerBhp: isTruckSearch ? parseFiniteSearchNumber(params.enginePowerMin) : undefined,
    maxEnginePowerBhp: isTruckSearch ? parseFiniteSearchNumber(params.enginePowerMax) : undefined,
  };
}
