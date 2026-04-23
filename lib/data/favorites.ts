import { createClient } from "@/lib/supabase/server";
import type { DashboardFavoriteItem } from "@/lib/types/favorites";
import type { Listing } from "@/lib/types/listing";

type FavoriteListingRow = {
  id: string;
  created_at: string;
  listing: Listing | Listing[] | null;
};

function normalizeListing(listing: FavoriteListingRow["listing"]) {
  if (!listing) return null;
  return Array.isArray(listing) ? (listing[0] ?? null) : listing;
}

const FAVORITE_LISTING_SELECT = `
  id,
  created_at,
  listing:listings!inner(
    *,
    images:listing_images(id, r2_key, alt_text, image_order),
    seller:profiles!seller_id(id, full_name, avatar_url),
    dealer:dealers(id, name, logo_url, city)
  )
`;

export async function getCurrentUserFavoriteListingIds(listingIds?: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [] as string[];
  }

  let query = supabase
    .from("wishlists")
    .select("listing_id")
    .eq("user_id", user.id);

  if (listingIds && listingIds.length > 0) {
    query = query.in("listing_id", listingIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching favorite listing ids:", error);
    return [];
  }

  return (data || []).map((row) => row.listing_id);
}

export async function getDashboardFavoritesData(): Promise<DashboardFavoriteItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select(FAVORITE_LISTING_SELECT)
    .eq("user_id", user.id)
    .eq("listing.status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dashboard favorites:", error);
    return [];
  }

  return ((data || []) as FavoriteListingRow[])
    .map((row) => {
      const listing = normalizeListing(row.listing);
      if (!listing) return null;

      return {
        wishlistId: row.id,
        savedAt: row.created_at,
        listing,
      } satisfies DashboardFavoriteItem;
    })
    .filter((item): item is DashboardFavoriteItem => Boolean(item));
}

