"use server";

import { revalidatePath } from "next/cache";
import type { ListingStatus } from "@/lib/constants/marketplace";
import { createClient } from "@/lib/supabase/server";
import { isPrivateSellerRole } from "@/lib/supabase/auth-routing";
import {
  dealerSaleIntakeSchema,
  type DealerSaleIntake,
} from "@/lib/validations/dealer-sale";
import {
  buildDealerSaleDescription,
  buildDealerSaleMetadata,
  buildDealerSaleSettingsNote,
  getDealerSaleListingCondition,
} from "@/lib/utils/dealer-sale";

async function requirePrivateSeller() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "AUTH_REQUIRED" } as const;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (profileError || !isPrivateSellerRole(profile?.role)) {
    return {
      error: "Only a private seller can submit a dealer-sale request.",
    } as const;
  }

  return { supabase, user } as const;
}

function getDealerSaleListingValues(input: DealerSaleIntake) {
  return {
    sale_channel: input.saleChannel,
    make: input.make,
    model: input.model,
    year: input.year,
    price: input.expectedPrice,
    currency: "KES",
    mileage: input.mileage,
    transmission: input.transmission,
    fuel_type: input.fuelType,
    condition: getDealerSaleListingCondition(input.marketCondition),
    description: buildDealerSaleDescription(input),
    features: [],
    metadata: buildDealerSaleMetadata(input),
    updated_at: new Date().toISOString(),
  };
}

function revalidateDealerSalePaths(listingId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/search");
  revalidatePath(`/vehicle/${listingId}`);
}

export async function createDealerSaleDraft(input: unknown) {
  const access = await requirePrivateSeller();
  if ("error" in access) return { error: access.error };

  const parsed = dealerSaleIntakeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message || "Dealer-sale details are invalid.",
    };
  }

  const { supabase, user } = access;
  const data = parsed.data;
  const { data: existing, error: existingError } = await supabase
    .from("listings")
    .select("id, status, sale_channel")
    .eq("seller_id", user.id)
    .eq("metadata->>dealerSaleRequestId", data.requestId)
    .maybeSingle<{
      id: string;
      status: ListingStatus;
      sale_channel: string;
    }>();

  if (existingError) {
    return { error: existingError.message };
  }

  if (
    existing &&
    (existing.status === "pending" ||
      existing.status === "active" ||
      existing.status === "reserved")
  ) {
    return {
      success: true,
      listingId: existing.id,
      status: existing.status,
      alreadySubmitted: true,
    } as const;
  }

  if (existing && existing.status !== "draft") {
    return { error: "This dealer-sale request can no longer be resumed." };
  }

  const listingValues = getDealerSaleListingValues(data);
  let listingId = existing?.id ?? null;

  if (listingId) {
    const { error } = await supabase
      .from("listings")
      .update(listingValues)
      .eq("id", listingId)
      .eq("seller_id", user.id)
      .eq("status", "draft");

    if (error) return { error: error.message };
  } else {
    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        dealer_id: null,
        status: "draft",
        ...listingValues,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !listing) {
      return {
        error: error?.message || "Unable to create the dealer-sale draft.",
      };
    }
    listingId = listing.id;
  }

  const { error: settingsError } = await supabase
    .from("listing_offer_settings")
    .upsert(
      {
        listing_id: listingId,
        seller_id: user.id,
        is_enabled: false,
        minimum_offer_amount: null,
        currency: "KES",
        expires_at: null,
        seller_note: buildDealerSaleSettingsNote(data),
      },
      { onConflict: "listing_id" },
    );

  if (settingsError) {
    return {
      error: `${settingsError.message} The vehicle draft was saved and can be retried.`,
      listingId,
    };
  }

  revalidateDealerSalePaths(listingId);
  return {
    success: true,
    listingId,
    status: "draft",
    alreadySubmitted: false,
  } as const;
}

export async function completeDealerSaleRequest(listingId: string) {
  const access = await requirePrivateSeller();
  if ("error" in access) return { error: access.error };

  const normalizedListingId = listingId.trim();
  if (!normalizedListingId) return { error: "Listing id is required." };

  const { supabase, user } = access;
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, status, sale_channel")
    .eq("id", normalizedListingId)
    .eq("seller_id", user.id)
    .maybeSingle<{
      id: string;
      seller_id: string;
      status: ListingStatus;
      sale_channel: string;
    }>();

  if (listingError || !listing) {
    return { error: listingError?.message || "Dealer-sale draft not found." };
  }
  if (
    listing.sale_channel !== "dealer_public" &&
    listing.sale_channel !== "dealer_only"
  ) {
    return { error: "This listing is not a dealer-sale request." };
  }
  if (listing.status === "reserved") {
    return {
      success: true,
      listingId: listing.id,
      status: listing.status,
    } as const;
  }
  if (
    listing.status !== "draft" &&
    listing.status !== "pending" &&
    listing.status !== "active"
  ) {
    return {
      error: "This dealer-sale request is no longer open for submission.",
    };
  }

  const { count: imageCount, error: imageError } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listing.id);

  if (imageError) return { error: imageError.message };
  if ((imageCount ?? 0) < 5) {
    return { error: "At least five finalized vehicle photos are required." };
  }

  const { data: settings, error: settingsError } = await supabase
    .from("listing_offer_settings")
    .update({ is_enabled: true, updated_at: new Date().toISOString() })
    .eq("listing_id", listing.id)
    .eq("seller_id", user.id)
    .select("listing_id")
    .maybeSingle<{ listing_id: string }>();

  if (settingsError || !settings) {
    return {
      error: settingsError?.message || "Dealer offer settings were not found.",
    };
  }

  if (listing.status === "draft") {
    const { error: statusError } = await supabase
      .from("listings")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", listing.id)
      .eq("seller_id", user.id)
      .eq("status", "draft");

    if (statusError) return { error: statusError.message };
  }

  revalidateDealerSalePaths(listing.id);
  return {
    success: true,
    listingId: listing.id,
    status: listing.status === "draft" ? "pending" : listing.status,
  } as const;
}
