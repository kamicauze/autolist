import type { ListingCategory } from "@/lib/constants/marketplace";

/**
 * Per-category search filter configuration.
 *
 * Drives which filters render on /search for the active category and how the
 * shared ones are labelled. Add a category (or tweak a category's filter set)
 * by editing SEARCH_FILTER_CONFIG only.
 */

export type SearchFilterId =
  | "keyword"
  | "make"
  | "model"
  | "location"
  | "sortBy"
  | "condition"
  | "year"
  | "price"
  | "mileage"
  | "bodyType"
  | "transmission"
  | "fuelType"
  | "color"
  | "seats"
  | "doors"
  | "driveType"
  | "engineCc"
  | "equipmentType"
  | "taxonomy"
  | "hoursUsed"
  | "axleConfig"
  | "gvm"
  | "cabType"
  | "enginePower"
  | "sellerType"
  | "verifiedOnly";

export type SearchFilterCategoryConfig = {
  /** Filters rendered for this category. */
  visible: readonly SearchFilterId[];
  /** Label overrides for shared filters (fallback: the default label). */
  labels?: Partial<Record<SearchFilterId, string>>;
};

const CAR_VAN_FILTERS: readonly SearchFilterId[] = [
  "keyword",
  "make",
  "model",
  "location",
  "sortBy",
  "condition",
  "year",
  "price",
  "mileage",
  "bodyType",
  "transmission",
  "fuelType",
  "color",
  "seats",
  "doors",
  "driveType",
  "sellerType",
  "verifiedOnly",
];

export const SEARCH_FILTER_CONFIG: Record<ListingCategory, SearchFilterCategoryConfig> = {
  car: {
    visible: CAR_VAN_FILTERS,
  },
  van: {
    visible: CAR_VAN_FILTERS,
  },
  motorbike: {
    visible: [
      "keyword",
      "make",
      "model",
      "location",
      "sortBy",
      "condition",
      "year",
      "price",
      "mileage",
      "engineCc",
      "bodyType",
      "transmission",
      "fuelType",
      "color",
      "sellerType",
      "verifiedOnly",
    ],
    labels: {
      model: "Model / Series",
    },
  },
  truck: {
    visible: [
      "keyword",
      "make",
      "model",
      "location",
      "sortBy",
      "condition",
      "year",
      "price",
      "mileage",
      "taxonomy",
      "bodyType",
      "axleConfig",
      "gvm",
      "cabType",
      "enginePower",
      "transmission",
      "fuelType",
      "color",
      "sellerType",
      "verifiedOnly",
    ],
    labels: {
      model: "Model / Series",
    },
  },
  plant_construction: {
    visible: [
      "keyword",
      "make",
      "model",
      "equipmentType",
      "taxonomy",
      "hoursUsed",
      "location",
      "sortBy",
      "condition",
      "year",
      "price",
      "sellerType",
      "verifiedOnly",
    ],
    labels: {
      make: "Manufacturer",
      model: "Model / Type",
    },
  },
  farm_agricultural: {
    visible: [
      "keyword",
      "make",
      "model",
      "equipmentType",
      "taxonomy",
      "hoursUsed",
      "location",
      "sortBy",
      "condition",
      "year",
      "price",
      "sellerType",
      "verifiedOnly",
    ],
    labels: {
      make: "Manufacturer",
      model: "Model / Type",
    },
  },
};

export function getSearchFilterConfig(
  category: string | null | undefined
): SearchFilterCategoryConfig {
  if (category && category in SEARCH_FILTER_CONFIG) {
    return SEARCH_FILTER_CONFIG[category as ListingCategory];
  }
  // No category selected: show the full (car-style) filter set.
  return { visible: CAR_VAN_FILTERS };
}

export function isSearchFilterVisible(
  category: string | null | undefined,
  filter: SearchFilterId
): boolean {
  return getSearchFilterConfig(category).visible.includes(filter);
}

export function getSearchFilterLabel(
  category: string | null | undefined,
  filter: SearchFilterId,
  fallback: string
): string {
  return getSearchFilterConfig(category).labels?.[filter] ?? fallback;
}

/**
 * Engine size buckets for motorbikes; values are "min-max" (open-ended max allowed).
 * Bucket boundaries follow the stakeholder doc's CC steps (50…1200).
 */
export const ENGINE_CC_OPTIONS = [
  { label: "50cc & under", value: "0-50" },
  { label: "50 - 125cc", value: "50-125" },
  { label: "125 - 200cc", value: "125-200" },
  { label: "200 - 400cc", value: "200-400" },
  { label: "400 - 600cc", value: "400-600" },
  { label: "600 - 700cc", value: "600-700" },
  { label: "700 - 800cc", value: "700-800" },
  { label: "800 - 900cc", value: "800-900" },
  { label: "900 - 1000cc", value: "900-1000" },
  { label: "1000 - 1100cc", value: "1000-1100" },
  { label: "1100 - 1200cc", value: "1100-1200" },
  { label: "1200cc +", value: "1200-" },
] as const;
