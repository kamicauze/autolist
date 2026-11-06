import type { SORT_OPTIONS } from "@/lib/constants/filters";
import type { ListingSort } from "@/lib/types/listing";

export const DEALER_INVENTORY_PAGE_SIZE = 12;
export type DealerInventorySort = (typeof SORT_OPTIONS)[number]["value"];

export const DEALER_INVENTORY_SORTS: Record<DealerInventorySort, ListingSort> = {
  newest: { field: "created_at", direction: "desc" },
  oldest: { field: "created_at", direction: "asc" },
  price_low: { field: "price", direction: "asc" },
  price_high: { field: "price", direction: "desc" },
  year_new: { field: "year", direction: "desc" },
  year_old: { field: "year", direction: "asc" },
  mileage_low: { field: "mileage", direction: "asc" },
  mileage_high: { field: "mileage", direction: "desc" },
};

export function parseDealerInventorySort(value: unknown): DealerInventorySort {
  return typeof value === "string" && Object.hasOwn(DEALER_INVENTORY_SORTS, value)
    ? (value as DealerInventorySort)
    : "newest";
}

export function getDealerInventoryHref(dealerId: string, page: number, sortBy: DealerInventorySort) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sortBy !== "newest") params.set("sortBy", sortBy);
  const query = params.toString();
  return `/dealers/${encodeURIComponent(dealerId)}${query ? `?${query}` : ""}#inventory`;
}
