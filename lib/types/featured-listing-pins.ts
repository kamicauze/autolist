import type { Listing } from "@/lib/types/listing";

export const FEATURED_LISTING_PIN_STATUSES = ["active", "paused"] as const;

export type FeaturedListingPinStatus = (typeof FEATURED_LISTING_PIN_STATUSES)[number];

export type FeaturedListingPinVisibility = "live" | "scheduled" | "expired" | "paused";

export type FeaturedListingPin = {
  id: string;
  listingId: string;
  status: FeaturedListingPinStatus;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  visibility: FeaturedListingPinVisibility;
  listing: Listing;
};

export type FeaturedListingPinCandidate = {
  listing: Listing;
  pinId: string | null;
};

export type AdminFeaturedListingPinsData = {
  pins: FeaturedListingPin[];
  candidates: FeaturedListingPinCandidate[];
  stats: {
    total: number;
    live: number;
    paused: number;
    scheduled: number;
    expired: number;
  };
  schemaReady: boolean;
  error?: string | null;
};

export type SaveFeaturedListingPinInput = {
  id?: string;
  listingId: string;
  status: FeaturedListingPinStatus;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type SaveFeaturedListingPinResult =
  | {
      success: true;
      pin: FeaturedListingPin;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export type DeleteFeaturedListingPinResult =
  | {
      success: true;
      pinId: string;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export type SearchFeaturedListingPinCandidatesResult =
  | {
      success: true;
      candidates: FeaturedListingPinCandidate[];
    }
  | {
      success: false;
      error: string;
    };
