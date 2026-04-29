import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import { getFeaturedListings, searchListings } from "@/lib/data/listings";
import type { Listing } from "@/lib/types/listing";
import type {
  AdminFeaturedListingPinsData,
  FeaturedListingPin,
  FeaturedListingPinCandidate,
  FeaturedListingPinStatus,
  FeaturedListingPinVisibility,
} from "@/lib/types/featured-listing-pins";

type FeaturedListingPinRow = {
  id: string;
  listing_id: string;
  status: FeaturedListingPinStatus;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  listing: Listing | Listing[] | null;
};

const FEATURED_LISTING_PIN_SELECT = `
  id,
  listing_id,
  status,
  sort_order,
  starts_at,
  ends_at,
  created_at,
  updated_at,
  listing:listings!inner(
    *,
    images:listing_images(id, listing_id, r2_key, alt_text, image_order, is_watermarked, created_at),
    seller:profiles!seller_id(id, full_name, avatar_url),
    dealer:dealers(id, name, logo_url, city)
  )
`;

const EMPTY_ADMIN_FEATURED_LISTING_PINS_DATA: AdminFeaturedListingPinsData = {
  pins: [],
  candidates: [],
  stats: {
    total: 0,
    live: 0,
    paused: 0,
    scheduled: 0,
    expired: 0,
  },
  schemaReady: false,
  error: null,
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export function getFeaturedListingPinVisibility(
  pin: Pick<FeaturedListingPin, "status" | "startsAt" | "endsAt">,
  now = new Date()
): FeaturedListingPinVisibility {
  if (pin.status === "paused") return "paused";

  const nowTime = now.getTime();
  if (pin.startsAt && new Date(pin.startsAt).getTime() > nowTime) return "scheduled";
  if (pin.endsAt && new Date(pin.endsAt).getTime() <= nowTime) return "expired";

  return "live";
}

export function mapFeaturedListingPinRow(row: FeaturedListingPinRow): FeaturedListingPin | null {
  const listing = firstRelation(row.listing);
  if (!listing) return null;

  const pin = {
    id: row.id,
    listingId: row.listing_id,
    status: row.status,
    sortOrder: Number(row.sort_order || 0),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listing,
  };

  return {
    ...pin,
    visibility: getFeaturedListingPinVisibility(pin),
  };
}

function getPinStats(pins: FeaturedListingPin[]): AdminFeaturedListingPinsData["stats"] {
  return {
    total: pins.length,
    live: pins.filter((pin) => pin.visibility === "live").length,
    paused: pins.filter((pin) => pin.visibility === "paused").length,
    scheduled: pins.filter((pin) => pin.visibility === "scheduled").length,
    expired: pins.filter((pin) => pin.visibility === "expired").length,
  };
}

async function getPinnedListingIds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_listing_pins")
    .select("id, listing_id");

  if (isMissingRelationError(error)) {
    return new Map<string, string>();
  }

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data || []).map((row) => [row.listing_id as string, row.id as string]));
}

export async function getFeaturedListingPinCandidates(
  query = "",
  limit = 12
): Promise<FeaturedListingPinCandidate[]> {
  const normalizedQuery = query.trim();
  const [pinByListingId, listingResult] = await Promise.all([
    getPinnedListingIds(),
    searchListings({
      filters: normalizedQuery ? { q: normalizedQuery } : undefined,
      sort: { field: "created_at", direction: "desc" },
      page: 1,
      limit,
    }),
  ]);

  return listingResult.listings.map((listing) => ({
    listing,
    pinId: pinByListingId.get(listing.id) ?? null,
  }));
}

export async function getFeaturedListingPins(): Promise<{
  pins: FeaturedListingPin[];
  schemaReady: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_listing_pins")
    .select(FEATURED_LISTING_PIN_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (isMissingRelationError(error)) {
    return { pins: [], schemaReady: false };
  }

  if (error) {
    throw new Error(error.message);
  }

  return {
    pins: ((data || []) as unknown as FeaturedListingPinRow[])
      .map(mapFeaturedListingPinRow)
      .filter((pin): pin is FeaturedListingPin => Boolean(pin)),
    schemaReady: true,
  };
}

export async function getActiveFeaturedListingPins(limit = 8): Promise<FeaturedListingPin[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  let query = supabase
    .from("featured_listing_pins")
    .select(FEATURED_LISTING_PIN_SELECT)
    .eq("status", "active")
    .eq("listing.status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (isMissingRelationError(error)) {
    return [];
  }

  if (error) {
    console.error("Error fetching featured listing pins:", error);
    return [];
  }

  return ((data || []) as unknown as FeaturedListingPinRow[])
    .map(mapFeaturedListingPinRow)
    .filter((pin): pin is FeaturedListingPin => Boolean(pin))
    .filter((pin) => pin.visibility === "live");
}

export const getAdminFeaturedListingPinsData = cache(
  async (): Promise<AdminFeaturedListingPinsData> => {
    try {
      const [pinResult, candidates] = await Promise.all([
        getFeaturedListingPins(),
        getFeaturedListingPinCandidates("", 12),
      ]);

      return {
        pins: pinResult.pins,
        candidates,
        stats: getPinStats(pinResult.pins),
        schemaReady: pinResult.schemaReady,
        error: null,
      };
    } catch (error) {
      return {
        ...EMPTY_ADMIN_FEATURED_LISTING_PINS_DATA,
        schemaReady: true,
        error: error instanceof Error ? error.message : "Featured listing pins could not be loaded.",
      };
    }
  }
);

export async function getHomepageFeaturedListings(limit = 8): Promise<Listing[]> {
  const pins = await getActiveFeaturedListingPins(limit);

  if (pins.length > 0) {
    return pins.map((pin) => pin.listing);
  }

  return getFeaturedListings(limit);
}
