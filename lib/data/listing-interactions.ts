import "server-only";
import { createOptionalAdminClient } from "@/lib/supabase/admin";

export type ListingInteractionTotal = { days: number; call_clicks: number | string; financing_clicks: number | string };

// IDs must come from the server's ownership-scoped getMyListings(), never a client request.
export async function getListingInteractionTotals(listingIds: string[]): Promise<ListingInteractionTotal[] | null> {
  const admin = createOptionalAdminClient();
  if (!admin) return null;
  if (!listingIds.length) return [1, 7, 30].map(days => ({ days, call_clicks: 0, financing_clicks: 0 }));
  const { data, error } = await admin.rpc("get_listing_interaction_totals", { p_listing_ids: listingIds });
  if (error) { console.error("Listing interaction totals unavailable:", error.message); return null; }
  return data as ListingInteractionTotal[];
}
