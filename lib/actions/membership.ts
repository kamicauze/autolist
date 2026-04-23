'use server'

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SELLER_PACKAGE_BILLING_DAYS,
  getSellerPackagePlan,
} from "@/lib/data/membership";
import type { SellerPackagePlanId } from "@/lib/types/membership";

function addBillingDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function buildManualPaymentReference(userId: string, planId: SellerPackagePlanId) {
  return `pkg_${planId}_${userId.slice(0, 8)}_${randomUUID().slice(0, 8)}`;
}

export async function activateSellerPackagePlan(planId: SellerPackagePlanId) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const plan = getSellerPackagePlan(planId);
  if (!plan) {
    return { error: "Unknown seller package." };
  }

  let adminSupabase;
  try {
    adminSupabase = createAdminClient();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Seller package activation is not configured.",
    };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const endsAtIso = addBillingDays(now, SELLER_PACKAGE_BILLING_DAYS).toISOString();

  const { error: expireStaleError } = await adminSupabase
    .from("seller_package_entitlements")
    .update({
      status: "expired",
      updated_at: nowIso,
    })
    .eq("user_id", user.id)
    .eq("status", "active")
    .lte("ends_at", nowIso);

  if (expireStaleError) {
    return { error: expireStaleError.message };
  }

  const { data: activeEntitlement, error: activeEntitlementError } = await adminSupabase
    .from("seller_package_entitlements")
    .select("id, plan_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("ends_at", nowIso)
    .order("starts_at", { ascending: false })
    .maybeSingle<{
      id: string;
      plan_id: string;
    }>();

  if (activeEntitlementError) {
    return { error: activeEntitlementError.message };
  }

  if (activeEntitlement?.plan_id === planId) {
    return { error: `${plan.name} is already active on this seller account.` };
  }

  if (activeEntitlement?.id) {
    const { error: cancelExistingError } = await adminSupabase
      .from("seller_package_entitlements")
      .update({
        status: "cancelled",
        ends_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", activeEntitlement.id);

    if (cancelExistingError) {
      return { error: cancelExistingError.message };
    }
  }

  const paymentReference = buildManualPaymentReference(user.id, planId);
  const { data: paymentRecord, error: paymentError } = await adminSupabase
    .from("payments")
    .insert({
      user_id: user.id,
      reference: paymentReference,
      provider: "manual",
      amount: plan.priceKes,
      currency: "KES",
      status: "succeeded",
      purpose: "subscription",
      metadata: {
        source: "dashboard_membership",
        plan_id: plan.id,
        plan_name: plan.name,
        listing_limit: plan.listingLimit,
        billing_days: SELLER_PACKAGE_BILLING_DAYS,
      },
    })
    .select("id")
    .single<{ id: string }>();

  if (paymentError || !paymentRecord) {
    return { error: paymentError?.message || "Unable to record the package payment." };
  }

  const { error: entitlementError } = await adminSupabase
    .from("seller_package_entitlements")
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      status: "active",
      listing_limit: plan.listingLimit,
      starts_at: nowIso,
      ends_at: endsAtIso,
      auto_renew: false,
      payment_id: paymentRecord.id,
      metadata: {
        plan_name: plan.name,
        price_kes: plan.priceKes,
        period_days: SELLER_PACKAGE_BILLING_DAYS,
      },
      updated_at: nowIso,
    });

  if (entitlementError) {
    await adminSupabase.from("payments").delete().eq("id", paymentRecord.id);
    return { error: entitlementError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/listings/new");
  revalidatePath("/dashboard/membership");

  return {
    success: true,
    planId: plan.id,
    planName: plan.name,
    renewalDate: endsAtIso,
  };
}
