'use server'

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setListingWishlistState(listingId: string, shouldFavorite: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "AUTH_REQUIRED" };
  }

  const normalizedListingId = listingId.trim();
  if (!normalizedListingId) {
    return { error: "Missing listing id." };
  }

  if (shouldFavorite) {
    const { error } = await supabase.from("wishlists").upsert(
      {
        user_id: user.id,
        listing_id: normalizedListingId,
      },
      {
        onConflict: "user_id,listing_id",
      }
    );

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", normalizedListingId);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/dashboard/favorites");
  revalidatePath(`/vehicle/${normalizedListingId}`);

  return {
    success: true,
    isFavorited: shouldFavorite,
  };
}

