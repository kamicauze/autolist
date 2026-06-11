'use server'

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SELLER_PACKAGE_BILLING_DAYS,
  SELLER_PACKAGE_FREE_TRIAL_DAYS,
  SELLER_PACKAGE_FREE_TRIAL_MONTHS,
  getSellerPackagePlan,
} from "@/lib/data/membership";
import type { SellerPackagePlanId } from "@/lib/types/membership";

function addBillingDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addBillingMonths(date: Date, months: number) {
  const next = new Date(date);
  const dayOfMonth = next.getUTCDate();

  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + months);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
  ).getUTCDate();
  next.setUTCDate(Math.min(dayOfMonth, lastDayOfTargetMonth));

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

  // billing.view is read-only — reps cannot purchase/activate the dealer's plan.
  const { data: repRow } = await supabase
    .from("dealer_sales_agents")
    .select("id")
    .eq("agent_profile_id", user.id)
    .eq("status", "active")
    .eq("invite_status", "accepted")
    .maybeSingle<{ id: string }>();

  if (repRow) {
    return { error: "Sales reps have read-only access to dealership billing." };
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
    .select("id, plan_id, ends_at, metadata")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("ends_at", nowIso)
    .order("starts_at", { ascending: false })
    .maybeSingle<{
      id: string;
      plan_id: string;
      ends_at: string;
      metadata: Record<string, unknown> | null;
    }>();

  if (activeEntitlementError) {
    return { error: activeEntitlementError.message };
  }

  if (activeEntitlement?.plan_id === planId) {
    return { error: `${plan.name} is already active on this seller account.` };
  }

  const { data: priorEntitlements, error: priorEntitlementsError } = await adminSupabase
    .from("seller_package_entitlements")
    .select("id, metadata")
    .eq("user_id", user.id)
    .limit(50);

  if (priorEntitlementsError) {
    return { error: priorEntitlementsError.message };
  }

  const hasUsedIntroTrial = (priorEntitlements ?? []).some((row) => {
    const metadata =
      row && typeof row === "object" && "metadata" in row && row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : null;
    return metadata?.intro_trial === true;
  });

  const activeEntitlementMetadata =
    activeEntitlement?.metadata && typeof activeEntitlement.metadata === "object"
      ? activeEntitlement.metadata
      : null;
  const shouldApplyIntroTrial =
    !hasUsedIntroTrial || activeEntitlementMetadata?.intro_trial === true;
  const entitlementEndsAtIso =
    shouldApplyIntroTrial && activeEntitlementMetadata?.intro_trial === true
      ? activeEntitlement?.ends_at ?? addBillingMonths(now, SELLER_PACKAGE_FREE_TRIAL_MONTHS).toISOString()
      : shouldApplyIntroTrial
        ? addBillingMonths(now, SELLER_PACKAGE_FREE_TRIAL_MONTHS).toISOString()
        : endsAtIso;
  const chargeAmountKes = shouldApplyIntroTrial ? 0 : plan.priceKes;

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
      amount: chargeAmountKes,
      currency: "KES",
      status: "succeeded",
      purpose: "subscription",
      metadata: {
        source: "dashboard_membership",
        plan_id: plan.id,
        plan_name: plan.name,
        listing_limit: plan.listingLimit,
        billing_days: shouldApplyIntroTrial
          ? SELLER_PACKAGE_FREE_TRIAL_DAYS
          : SELLER_PACKAGE_BILLING_DAYS,
        billing_months: shouldApplyIntroTrial
          ? SELLER_PACKAGE_FREE_TRIAL_MONTHS
          : null,
        intro_trial: shouldApplyIntroTrial,
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
      ends_at: entitlementEndsAtIso,
      auto_renew: false,
      payment_id: paymentRecord.id,
      metadata: {
        plan_name: plan.name,
        price_kes: chargeAmountKes,
        period_days: shouldApplyIntroTrial
          ? SELLER_PACKAGE_FREE_TRIAL_DAYS
          : SELLER_PACKAGE_BILLING_DAYS,
        period_months: shouldApplyIntroTrial
          ? SELLER_PACKAGE_FREE_TRIAL_MONTHS
          : null,
        intro_trial: shouldApplyIntroTrial,
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
    renewalDate: entitlementEndsAtIso,
    trialApplied: shouldApplyIntroTrial,
  };
}
