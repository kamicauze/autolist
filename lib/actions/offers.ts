'use server'

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  ListingOffer,
  OfferActionResult,
  OfferSettingsActionResult,
} from "@/lib/types/offers";

function normalizeMessage(value?: string | null) {
  const message = value?.trim();
  return message ? message : null;
}

function normalizeAmount(value: number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function revalidateOfferPaths(listingId?: string | null) {
  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard/listings");
  revalidatePath("/search");

  if (listingId) {
    revalidatePath(`/vehicle/${listingId}`);
  }
}

function getActionError(error: { message?: string } | null | undefined) {
  return error?.message || "Something went wrong while updating the offer.";
}

export async function createListingOffer(input: {
  listingId: string;
  amount: number;
  message?: string | null;
  expiresAt?: string | null;
}): Promise<OfferActionResult> {
  const listingId = input.listingId.trim();
  const amount = normalizeAmount(input.amount);

  if (!listingId) {
    return { error: "Missing listing id." };
  }

  if (!amount || amount <= 0) {
    return { error: "Enter an offer amount greater than zero." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "AUTH_REQUIRED" };
  }

  const { data, error } = await supabase.rpc("create_listing_offer", {
    p_listing_id: listingId,
    p_amount: amount,
    p_message: normalizeMessage(input.message),
    p_expires_at: input.expiresAt || null,
  });

  if (error) {
    return { error: getActionError(error) };
  }

  const offer = data as ListingOffer;
  revalidateOfferPaths(offer.listing_id);

  return { success: true, offer };
}

export async function counterListingOffer(input: {
  offerId: string;
  amount: number;
  message?: string | null;
}): Promise<OfferActionResult> {
  const offerId = input.offerId.trim();
  const amount = normalizeAmount(input.amount);

  if (!offerId) {
    return { error: "Missing offer id." };
  }

  if (!amount || amount <= 0) {
    return { error: "Enter a counter amount greater than zero." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("counter_listing_offer", {
    p_offer_id: offerId,
    p_amount: amount,
    p_message: normalizeMessage(input.message),
  });

  if (error) {
    return { error: getActionError(error) };
  }

  const offer = data as ListingOffer;
  revalidateOfferPaths(offer.listing_id);

  return { success: true, offer };
}

export async function acceptListingOffer(offerId: string): Promise<OfferActionResult> {
  const normalizedOfferId = offerId.trim();
  if (!normalizedOfferId) {
    return { error: "Missing offer id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_listing_offer", {
    p_offer_id: normalizedOfferId,
  });

  if (error) {
    return { error: getActionError(error) };
  }

  const offer = data as ListingOffer;
  revalidateOfferPaths(offer.listing_id);

  return { success: true, offer };
}

export async function rejectListingOffer(
  offerId: string,
  message?: string | null
): Promise<OfferActionResult> {
  const normalizedOfferId = offerId.trim();
  if (!normalizedOfferId) {
    return { error: "Missing offer id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reject_listing_offer", {
    p_offer_id: normalizedOfferId,
    p_message: normalizeMessage(message),
  });

  if (error) {
    return { error: getActionError(error) };
  }

  const offer = data as ListingOffer;
  revalidateOfferPaths(offer.listing_id);

  return { success: true, offer };
}

export async function withdrawListingOffer(offerId: string): Promise<OfferActionResult> {
  const normalizedOfferId = offerId.trim();
  if (!normalizedOfferId) {
    return { error: "Missing offer id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("withdraw_listing_offer", {
    p_offer_id: normalizedOfferId,
  });

  if (error) {
    return { error: getActionError(error) };
  }

  const offer = data as ListingOffer;
  revalidateOfferPaths(offer.listing_id);

  return { success: true, offer };
}

export async function upsertListingOfferSettings(input: {
  listingId: string;
  isEnabled: boolean;
  minimumOfferAmount?: number | null;
  expiresAt?: string | null;
  sellerNote?: string | null;
}): Promise<OfferSettingsActionResult> {
  const listingId = input.listingId.trim();
  const minimumOfferAmount =
    input.minimumOfferAmount === null || input.minimumOfferAmount === undefined
      ? null
      : normalizeAmount(input.minimumOfferAmount);

  if (!listingId) {
    return { error: "Missing listing id." };
  }

  if (minimumOfferAmount !== null && minimumOfferAmount < 0) {
    return { error: "Minimum offer amount cannot be negative." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "AUTH_REQUIRED" };
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, currency")
    .eq("id", listingId)
    .maybeSingle<{ id: string; seller_id: string; currency: string | null }>();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (listing.seller_id !== user.id) {
    return { error: "Only the listing seller can update offer settings." };
  }

  const { data, error } = await supabase
    .from("listing_offer_settings")
    .upsert(
      {
        listing_id: listingId,
        seller_id: user.id,
        is_enabled: input.isEnabled,
        minimum_offer_amount: minimumOfferAmount,
        currency: listing.currency || "KES",
        expires_at: input.expiresAt || null,
        seller_note: normalizeMessage(input.sellerNote),
      },
      { onConflict: "listing_id" }
    )
    .select("*")
    .single();

  if (error) {
    return { error: getActionError(error) };
  }

  revalidateOfferPaths(listingId);

  return { success: true, settings: data };
}
