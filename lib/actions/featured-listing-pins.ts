"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import {
  FEATURED_LISTING_PIN_STATUSES,
  type DeleteFeaturedListingPinResult,
  type SaveFeaturedListingPinInput,
  type SaveFeaturedListingPinResult,
  type SearchFeaturedListingPinCandidatesResult,
} from "@/lib/types/featured-listing-pins";
import {
  getFeaturedListingPinCandidates,
  mapFeaturedListingPinRow,
} from "@/lib/data/featured-listing-pins";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type { Listing } from "@/lib/types/listing";
import type { SupabaseClient } from "@supabase/supabase-js";

type SavedFeaturedListingPinRow = {
  id: string;
  listing_id: string;
  status: "active" | "paused";
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  listing: Listing | Listing[] | null;
};

const FEATURED_LISTING_PIN_ACTION_SELECT = `
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

const saveFeaturedListingPinSchema = z.object({
  id: z.uuid().optional(),
  listingId: z.uuid(),
  status: z.enum(FEATURED_LISTING_PIN_STATUSES),
  sortOrder: z.number().int().min(0).max(10000),
  startsAt: z.string().trim().max(80).nullable().optional(),
  endsAt: z.string().trim().max(80).nullable().optional(),
});

function normalizeOptionalDate(
  value: string | null | undefined,
  label: string
): { value: string | null } | { error: string } {
  if (!value) return { value: null };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: `${label} must be a valid date and time.` };
  }

  return { value: date.toISOString() };
}

function revalidateFeaturedListingPinPaths(listingId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/featured-listings");

  if (listingId) {
    revalidatePath(`/vehicle/${listingId}`);
  }
}

async function ensureActiveListing(
  supabase: SupabaseClient,
  listingId: string
): Promise<{ success: true } | { error: string }> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .maybeSingle<{ id: string; status: string }>();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Listing not found." };
  }

  if (data.status !== "active") {
    return { error: "Only active listings can be pinned to the homepage rail." };
  }

  return { success: true };
}

export async function searchFeaturedListingPinCandidates(
  query: string
): Promise<SearchFeaturedListingPinCandidatesResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return { success: false, error: adminContext.error };
  }

  try {
    const candidates = await getFeaturedListingPinCandidates(query, 16);
    return { success: true, candidates };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to search listings.",
    };
  }
}

export async function saveFeaturedListingPin(
  input: SaveFeaturedListingPinInput
): Promise<SaveFeaturedListingPinResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return { success: false, error: adminContext.error };
  }

  const parsed = saveFeaturedListingPinSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid featured listing pin.",
    };
  }

  const startsAt = normalizeOptionalDate(parsed.data.startsAt, "Start date");
  if ("error" in startsAt) return { success: false, error: startsAt.error };

  const endsAt = normalizeOptionalDate(parsed.data.endsAt, "End date");
  if ("error" in endsAt) return { success: false, error: endsAt.error };

  if (
    startsAt.value &&
    endsAt.value &&
    new Date(endsAt.value).getTime() <= new Date(startsAt.value).getTime()
  ) {
    return { success: false, error: "End date must be after the start date." };
  }

  const listingCheck = await ensureActiveListing(adminContext.supabase, parsed.data.listingId);
  if ("error" in listingCheck) {
    return { success: false, error: listingCheck.error };
  }

  const payload = {
    listing_id: parsed.data.listingId,
    status: parsed.data.status,
    sort_order: parsed.data.sortOrder,
    starts_at: startsAt.value,
    ends_at: endsAt.value,
    updated_by: adminContext.user.id,
    ...(parsed.data.id ? {} : { created_by: adminContext.user.id }),
  };

  const mutation = parsed.data.id
    ? adminContext.supabase
        .from("featured_listing_pins")
        .update(payload)
        .eq("id", parsed.data.id)
    : adminContext.supabase
        .from("featured_listing_pins")
        .upsert(payload, { onConflict: "listing_id" });

  const { data, error } = await mutation
    .select(FEATURED_LISTING_PIN_ACTION_SELECT)
    .maybeSingle<SavedFeaturedListingPinRow>();

  if (isMissingRelationError(error)) {
    return {
      success: false,
      error: "The featured_listing_pins table is missing. Apply the latest Supabase migration first.",
    };
  }

  if (error || !data) {
    return { success: false, error: error?.message || "Failed to save featured listing pin." };
  }

  const pin = mapFeaturedListingPinRow(data);
  if (!pin) {
    return { success: false, error: "The saved featured listing pin could not be read." };
  }

  revalidateFeaturedListingPinPaths(pin.listingId);

  return {
    success: true,
    pin,
    message: parsed.data.id ? "Featured listing pin updated." : "Listing pinned to the homepage rail.",
  };
}

export async function deleteFeaturedListingPin(
  pinId: string
): Promise<DeleteFeaturedListingPinResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return { success: false, error: adminContext.error };
  }

  const parsedPinId = z.uuid().safeParse(pinId);
  if (!parsedPinId.success) {
    return { success: false, error: "Invalid featured listing pin." };
  }

  const { data, error } = await adminContext.supabase
    .from("featured_listing_pins")
    .delete()
    .eq("id", parsedPinId.data)
    .select("id, listing_id")
    .maybeSingle<{ id: string; listing_id: string }>();

  if (isMissingRelationError(error)) {
    return {
      success: false,
      error: "The featured_listing_pins table is missing. Apply the latest Supabase migration first.",
    };
  }

  if (error || !data) {
    return { success: false, error: error?.message || "Failed to remove featured listing pin." };
  }

  revalidateFeaturedListingPinPaths(data.listing_id);

  return {
    success: true,
    pinId: data.id,
    message: "Listing removed from the homepage rail.",
  };
}
