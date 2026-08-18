"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toListingAlertRecord } from "@/lib/data/listing-alerts";
import type {
  ListingAlertActionResult,
  ListingAlertInput,
  ListingAlertStatus,
} from "@/lib/types/listing-alerts";
import {
  buildListingAlertCriteria,
  buildListingAlertLabel,
  getListingAlertPriceBounds,
} from "@/lib/utils/listing-alerts";
import { listingAlertInputSchema } from "@/lib/validations/listing-alert";

const MAX_ALERTS_PER_USER = 20;

async function getAuthenticatedAlertContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error || !user ? null : { supabase, user };
}

async function validateAlertInput(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedAlertContext>>>,
  input: ListingAlertInput
): Promise<
  | { error: string }
  | {
      values: ReturnType<typeof buildAlertWriteValues>;
    }
> {
  const parsed = listingAlertInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the alert preferences." };
  }

  if (parsed.data.emailEnabled) {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", context.user.id)
      .maybeSingle<{ email: string | null }>();
    if (!profile?.email) {
      return { error: "Add an email address to your profile before enabling email alerts." };
    }
  }

  return { values: buildAlertWriteValues(context.user.id, parsed.data) };
}

function buildAlertWriteValues(
  userId: string,
  input: ReturnType<typeof listingAlertInputSchema.parse>
) {
  const { minPrice, maxPrice } = getListingAlertPriceBounds(input.priceRange);
  const criteria = buildListingAlertCriteria(
    input.category,
    input.primaryValue,
    input.secondaryValue
  );
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        category: input.category,
        make: input.make?.toLowerCase() || null,
        model: input.model?.toLowerCase() || null,
        location: input.location?.toLowerCase() || null,
        minYear: input.minYear ?? null,
        maxYear: input.maxYear ?? null,
        minPrice,
        maxPrice,
        criteria,
        emailEnabled: input.emailEnabled,
        priceDropEnabled: input.priceDropEnabled,
      })
    )
    .digest("hex");

  return {
    user_id: userId,
    fingerprint,
    label: buildListingAlertLabel(input),
    category: input.category,
    make: input.make || null,
    model: input.model || null,
    location: input.location || null,
    min_year: input.minYear ?? null,
    max_year: input.maxYear ?? null,
    min_price: minPrice,
    max_price: maxPrice,
    criteria,
    email_enabled: input.emailEnabled,
    price_drop_enabled: input.priceDropEnabled,
  };
}

export async function createListingAlert(
  input: ListingAlertInput
): Promise<ListingAlertActionResult> {
  const context = await getAuthenticatedAlertContext();
  if (!context) return { success: false, error: "Sign in to create a listing alert." };

  const { supabase, user } = context;
  const { count, error: countError } = await supabase
    .from("listing_alerts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) return { success: false, error: countError.message };
  if ((count || 0) >= MAX_ALERTS_PER_USER) {
    return { success: false, error: `You can save up to ${MAX_ALERTS_PER_USER} alerts.` };
  }

  const validation = await validateAlertInput(context, input);
  if ("error" in validation) return { success: false, error: validation.error };

  const { data, error } = await supabase
    .from("listing_alerts")
    .insert(validation.values)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error:
        error?.code === "23505"
          ? "You already have an alert with these preferences."
          : error?.message || "Unable to create the alert.",
    };
  }

  revalidatePath("/alerts");
  return {
    success: true,
    alert: toListingAlertRecord(data),
    message: "Alert created. Matching listings will appear in Notifications.",
  };
}

export async function updateListingAlert(
  alertId: string,
  input: ListingAlertInput
): Promise<ListingAlertActionResult> {
  const context = await getAuthenticatedAlertContext();
  if (!context) return { success: false, error: "Sign in to update this alert." };

  const validation = await validateAlertInput(context, input);
  if ("error" in validation) return { success: false, error: validation.error };

  const { data, error } = await context.supabase
    .from("listing_alerts")
    .update(validation.values)
    .eq("id", alertId)
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error:
        error?.code === "23505"
          ? "Another saved alert already uses these preferences."
          : error?.message || "Alert not found.",
    };
  }

  revalidatePath("/alerts");
  return {
    success: true,
    alert: toListingAlertRecord(data),
    message: "Alert updated.",
  };
}

export async function setListingAlertStatus(
  alertId: string,
  status: ListingAlertStatus
): Promise<ListingAlertActionResult> {
  if (status !== "active" && status !== "paused") {
    return { success: false, error: "Invalid alert status." };
  }

  const context = await getAuthenticatedAlertContext();
  if (!context) return { success: false, error: "Sign in to manage this alert." };

  const { data, error } = await context.supabase
    .from("listing_alerts")
    .update({ status })
    .eq("id", alertId)
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: error?.message || "Alert not found." };
  }

  revalidatePath("/alerts");
  return {
    success: true,
    alert: toListingAlertRecord(data),
    message: status === "active" ? "Alert resumed." : "Alert paused.",
  };
}

export async function deleteListingAlert(
  alertId: string
): Promise<ListingAlertActionResult> {
  const context = await getAuthenticatedAlertContext();
  if (!context) return { success: false, error: "Sign in to delete this alert." };

  const { data, error } = await context.supabase
    .from("listing_alerts")
    .delete()
    .eq("id", alertId)
    .eq("user_id", context.user.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    return { success: false, error: error?.message || "Alert not found." };
  }

  revalidatePath("/alerts");
  return { success: true, message: "Alert deleted." };
}
