import { createClient } from "@/lib/supabase/server";
import type { DealerProfile } from "@/lib/types/dealer";
import type { Listing } from "@/lib/types/listing";
import type {
  AvailableBidListing,
  ListingOffer,
  ListingOfferSettings,
  OfferEvent,
} from "@/lib/types/offers";

const OFFER_LISTING_SELECT = `
  *,
  images:listing_images(id, r2_key, alt_text, image_order),
  seller:profiles!seller_id(id, full_name, avatar_url),
  dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
`;

const OFFER_SELECT = `
  *,
  listing:listings(${OFFER_LISTING_SELECT}),
  dealer:dealers(id, profile_id, name, business_name, logo_url, city, mobile, email, whatsapp)
`;

type OfferSettingsWithListingRow = ListingOfferSettings & {
  listing: Listing | null;
};

export async function getCurrentApprovedDealer(): Promise<DealerProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("profile_id", user.id)
    .eq("status", "APPROVED")
    .maybeSingle();

  if (error) {
    console.error("Error fetching current dealer for offers:", error);
    return null;
  }

  return data as DealerProfile | null;
}

export async function getAvailableBidListingsForCurrentDealer(
  limit = 24,
): Promise<AvailableBidListing[]> {
  const dealer = await getCurrentApprovedDealer();

  if (!dealer) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_offer_settings")
    .select(
      `
        *,
        listing:listings!inner(${OFFER_LISTING_SELECT})
      `,
    )
    .eq("is_enabled", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .in("listing.status", ["pending", "active"])
    .neq("listing.seller_id", dealer.profile_id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching available bid listings:", error);
    return [];
  }

  return ((data || []) as unknown as OfferSettingsWithListingRow[])
    .filter((row) => row.listing)
    .map((row) => {
      const { listing, ...settings } = row;
      return {
        ...(listing as Listing),
        offer_settings: settings,
      };
    });
}

export async function getMyDealerOffers(limit = 50): Promise<ListingOffer[]> {
  const dealer = await getCurrentApprovedDealer();

  if (!dealer) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_offers")
    .select(OFFER_SELECT)
    .eq("dealer_profile_id", dealer.profile_id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dealer offers:", error);
    return [];
  }

  return (data || []) as unknown as ListingOffer[];
}

export async function getOffersReceivedByCurrentSeller(
  limit = 50,
): Promise<ListingOffer[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("listing_offers")
    .select(OFFER_SELECT)
    .eq("seller_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching received offers:", error);
    return [];
  }

  return (data || []) as unknown as ListingOffer[];
}

export async function getOfferEvents(offerId: string): Promise<OfferEvent[]> {
  const normalizedOfferId = offerId.trim();
  if (!normalizedOfferId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offer_events")
    .select("*")
    .eq("offer_id", normalizedOfferId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching offer events:", error);
    return [];
  }

  return (data || []) as OfferEvent[];
}

export async function getOfferSettingsForListing(
  listingId: string,
): Promise<ListingOfferSettings | null> {
  const normalizedListingId = listingId.trim();
  if (!normalizedListingId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_offer_settings")
    .select("*")
    .eq("listing_id", normalizedListingId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching offer settings:", error);
    return null;
  }

  return data as ListingOfferSettings | null;
}
