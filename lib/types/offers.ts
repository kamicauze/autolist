import type { Listing } from "@/lib/types/listing";
import type { DealerProfile } from "@/lib/types/dealer";

export type OfferStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export type OfferEventType =
  | "created"
  | "countered"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export interface ListingOfferSettings {
  listing_id: string;
  seller_id: string;
  is_enabled: boolean;
  minimum_offer_amount: number | null;
  currency: string;
  expires_at: string | null;
  seller_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingOffer {
  id: string;
  listing_id: string;
  seller_id: string;
  dealer_id: string;
  dealer_profile_id: string;
  amount: number;
  currency: string;
  message: string | null;
  status: OfferStatus;
  expires_at: string | null;
  responded_at: string | null;
  accepted_at: string | null;
  withdrawn_at: string | null;
  last_actor_id: string | null;
  created_at: string;
  updated_at: string;
  listing?: Listing | null;
  dealer?: Pick<DealerProfile, "id" | "profile_id" | "name" | "business_name" | "logo_url" | "city" | "mobile" | "email" | "whatsapp"> | null;
}

export interface OfferEvent {
  id: string;
  offer_id: string;
  listing_id: string;
  actor_id: string;
  event_type: OfferEventType;
  from_status: OfferStatus | null;
  to_status: OfferStatus;
  amount: number | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AvailableBidListing extends Listing {
  offer_settings: ListingOfferSettings;
}

export type OfferActionResult =
  | { success: true; offer: ListingOffer }
  | { error: string };

export type OfferSettingsActionResult =
  | { success: true; settings: ListingOfferSettings }
  | { error: string };
