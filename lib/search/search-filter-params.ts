import {
  isSearchFilterVisible,
  type SearchFilterId,
} from "@/lib/constants/search-filter-config";

const SEARCH_PARAM_KEYS_BY_FILTER: Partial<Record<SearchFilterId, readonly string[]>> = {
  bodyType: ["bodyType"],
  transmission: ["transmission"],
  fuelType: ["fuelType"],
  color: ["color"],
  seats: ["seats"],
  doors: ["doors"],
  driveType: ["driveType"],
  mileage: ["minMileage", "maxMileage"],
  engineCc: ["engineCc"],
  taxonomy: ["taxCategory", "taxSubcategory"],
  hoursUsed: ["hoursMin", "hoursMax"],
  axleConfig: ["axleConfig"],
  gvm: ["gvmMin", "gvmMax"],
  cabType: ["cabType"],
  enginePower: ["enginePowerMin", "enginePowerMax"],
  sellerType: ["sellerType"],
  verifiedOnly: ["verifiedOnly"],
};

export function clearHiddenSearchFilterParams(
  params: URLSearchParams,
  category: string | null | undefined
) {
  for (const [filterId, keys] of Object.entries(SEARCH_PARAM_KEYS_BY_FILTER)) {
    if (!isSearchFilterVisible(category, filterId as SearchFilterId)) {
      keys.forEach((key) => params.delete(key));
    }
  }
}

export function serializeSearchFilterParams(params: URLSearchParams) {
  const stableParams = new URLSearchParams(params);
  stableParams.sort();
  return stableParams.toString();
}

export function parseFiniteSearchNumber(
  value: string | string[] | null | undefined
): number | undefined {
  const scalar = Array.isArray(value) ? value[0] : value;
  if (scalar == null || scalar.trim() === "") {
    return undefined;
  }

  const parsed = Number(scalar);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
