import { getPublicSellerReviewsData } from "@/lib/data/reviews";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import type { Listing, PublicSellerStats } from "@/lib/types/listing";

/**
 * Public seller card numbers for a listing: review average/count, join date
 * and active listing count. Dealer listings are counted by dealer_id and dated
 * by the dealers row; private sellers by their non-dealer listings and their
 * profile. Reviews are per seller profile, so a dealer owner who also sells
 * privately shares one rating across both.
 */
export async function getListingSellerStats(
  listing: Pick<Listing, "seller_id" | "dealer_id">
): Promise<PublicSellerStats | null> {
  const supabase = createOptionalAdminClient();
  if (!supabase) return null;

  const memberQuery = listing.dealer_id
    ? supabase.from("dealers").select("created_at").eq("id", listing.dealer_id)
    : supabase.from("profiles").select("created_at").eq("id", listing.seller_id);

  const activeListingsQuery = supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .neq("sale_channel", "dealer_only");

  const [reviewsData, memberResult, activeListingsResult] = await Promise.all([
    getPublicSellerReviewsData(listing.seller_id),
    memberQuery.maybeSingle<{ created_at: string | null }>(),
    listing.dealer_id
      ? activeListingsQuery.eq("dealer_id", listing.dealer_id)
      : activeListingsQuery.eq("seller_id", listing.seller_id).is("dealer_id", null),
  ]);

  if (memberResult.error) {
    console.error("Get seller member date error:", memberResult.error);
  }
  if (activeListingsResult.error) {
    console.error("Get seller active listings error:", activeListingsResult.error);
  }

  return {
    averageRating: reviewsData.summary.averageRating,
    totalReviews: reviewsData.summary.totalReviews,
    memberSince: memberResult.data?.created_at ?? null,
    activeListings: activeListingsResult.count ?? 0,
  };
}
