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

/** Engine size buckets for motorbikes; values are "min-max" (open-ended max allowed). */
export const ENGINE_CC_OPTIONS = [
  { label: "Under 150cc", value: "0-150" },
  { label: "150 - 500cc", value: "150-500" },
  { label: "500 - 1000cc", value: "500-1000" },
  { label: "1000cc +", value: "1000-" },
] as const;
