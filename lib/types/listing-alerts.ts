import type { ListingCategory } from "@/lib/constants/marketplace";
import type {
  ListingAlertCriterionKey,
  ListingAlertPriceRange,
} from "@/lib/constants/listing-alerts";

export type ListingAlertStatus = "active" | "paused";
export type ListingAlertMatchType = "new_listing" | "price_drop";

export type ListingAlertCriteria = Partial<Record<ListingAlertCriterionKey, string | number>>;

export type ListingAlertInput = {
  category: ListingCategory;
  make?: string;
  model?: string;
  location?: string;
  minYear?: number | string | null;
  maxYear?: number | string | null;
  priceRange: ListingAlertPriceRange;
  primaryValue?: string;
  secondaryValue?: string;
  emailEnabled: boolean;
  priceDropEnabled: boolean;
};

export type ListingAlertRecord = {
  id: string;
  userId: string;
  label: string;
  category: ListingCategory;
  make: string | null;
  model: string | null;
  location: string | null;
  minYear: number | null;
  maxYear: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  priceRange: ListingAlertPriceRange;
  criteria: ListingAlertCriteria;
  emailEnabled: boolean;
  priceDropEnabled: boolean;
  status: ListingAlertStatus;
  lastMatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListingAlertsPageData = {
  viewer: {
    id: string;
    email: string | null;
    fullName: string | null;
  } | null;
  alerts: ListingAlertRecord[];
  error: string | null;
};

export type ListingAlertActionResult =
  | { success: true; alert?: ListingAlertRecord; message: string }
  | { success: false; error: string };
