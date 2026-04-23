import type { Listing } from "@/lib/types/listing";

export interface DashboardFavoriteItem {
  wishlistId: string;
  savedAt: string;
  listing: Listing;
}

