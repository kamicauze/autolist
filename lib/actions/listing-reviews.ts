'use server'

import { revalidatePath } from "next/cache";
import { serializeEnquiryReviewMessage, parseEnquiryReviewMessage } from "@/lib/reviews/enquiry-fallback";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_LISTING_REVIEW_LENGTH,
  MIN_LISTING_REVIEW_LENGTH,
} from "@/lib/types/listing-review";

export async function upsertListingReview(input: {
  listingId: string;
  rating: number;
  body: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "AUTH_REQUIRED" };
  }

  const listingId = input.listingId.trim();
  const body = input.body.trim();
  const rating = Number(input.rating);

  if (!listingId) {
    return { error: "Missing listing id." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating between 1 and 5 stars." };
  }

  if (body.length < MIN_LISTING_REVIEW_LENGTH) {
    return {
      error: `Reviews should be at least ${MIN_LISTING_REVIEW_LENGTH} characters long.`,
    };
  }

  if (body.length > MAX_LISTING_REVIEW_LENGTH) {
    return {
      error: `Reviews should be under ${MAX_LISTING_REVIEW_LENGTH} characters.`,
    };
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .maybeSingle<{ id: string; seller_id: string }>();

  if (listingError || !listing) {
    return { error: "This listing is not available for review." };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot review your own listing." };
  }

  const { error } = await supabase.from("listing_reviews").upsert(
    {
      listing_id: listingId,
      reviewer_id: user.id,
      rating,
      body,
    },
    {
      onConflict: "listing_id,reviewer_id",
    }
  );

  if (error && !isMissingRelationError(error)) {
    return { error: error.message };
  }

  if (error && isMissingRelationError(error)) {
    const { data: existingReviews, error: existingError } = await supabase
      .from("enquiries")
      .select("id, message")
      .eq("listing_id", listingId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (existingError) {
      return { error: existingError.message };
    }

    const existingReview = (existingReviews || []).find((row) =>
      parseEnquiryReviewMessage(row.message)
    );
    const payload = {
      message: serializeEnquiryReviewMessage({ rating, body }),
      status: "closed" as const,
    };

    if (existingReview) {
      const { error: updateError } = await supabase
        .from("enquiries")
        .update(payload)
        .eq("id", existingReview.id);

      if (updateError) {
        return { error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase.from("enquiries").insert({
        listing_id: listingId,
        user_id: user.id,
        ...payload,
      });

      if (insertError) {
        return { error: insertError.message };
      }
    }
  }

  revalidatePath(`/vehicle/${listingId}`);
  revalidatePath("/dashboard/reviews");

  return { success: true };
}
