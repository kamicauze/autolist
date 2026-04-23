import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListingStatus } from "@/lib/types/listing";
import type {
  SellerMembershipDashboardData,
  SellerPackageAccessState,
  SellerPackageEntitlementRecord,
  SellerPackageListingUsageRecord,
  SellerPackagePaymentRecord,
  SellerPackagePlan,
  SellerPackagePlanId,
} from "@/lib/types/membership";

export const SELLER_PACKAGE_BILLING_DAYS = 30;

export const SELLER_PACKAGE_USAGE_STATUSES = [
  "draft",
  "pending",
  "active",
  "reserved",
] as const satisfies readonly ListingStatus[];

export const SELLER_PACKAGE_PLANS: SellerPackagePlan[] = [
  {
    id: "basic",
    name: "Basic",
    priceKes: 15_000,
    priceLabel: "KES 15,000",
    periodLabel: "/month",
    listingLimit: 3,
    features: ["3 active listing slots", "Priority listing review", "Dashboard analytics"],
  },
  {
    id: "professional",
    name: "Professional",
    priceKes: 45_000,
    priceLabel: "KES 45,000",
    periodLabel: "/month",
    listingLimit: 15,
    features: ["15 active listing slots", "Featured inventory", "Buyer lead insights"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceKes: 90_000,
    priceLabel: "KES 90,000",
    periodLabel: "/month",
    listingLimit: null,
    features: ["Unlimited active listings", "Dedicated support", "Multi-user dealership tools"],
  },
];

const SELLER_PACKAGE_PLAN_MAP = new Map(
  SELLER_PACKAGE_PLANS.map((plan) => [plan.id, plan])
);

const MEMBERSHIP_DATE_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const EMPTY_PACKAGE_ACCESS: SellerPackageAccessState = {
  activeEntitlement: null,
  currentPlan: null,
  usedListings: 0,
  listingLimit: 0,
  remainingListings: 0,
  hasActivePlan: false,
  canCreateListing: false,
  renewalDateLabel: null,
  billingCycleLabel: "Inactive",
};

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPackageEntitlementRecord(
  row: Record<string, unknown>
): SellerPackageEntitlementRecord | null {
  const listingLimit =
    typeof row.listing_limit === "number"
      ? row.listing_limit
      : typeof row.listing_limit === "string"
        ? Number(row.listing_limit)
        : null;

  if (
    typeof row.id !== "string" ||
    typeof row.user_id !== "string" ||
    typeof row.plan_id !== "string" ||
    typeof row.status !== "string" ||
    typeof row.starts_at !== "string" ||
    typeof row.ends_at !== "string" ||
    typeof row.auto_renew !== "boolean" ||
    typeof row.created_at !== "string" ||
    typeof row.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    plan_id: row.plan_id,
    status:
      row.status === "active" || row.status === "expired" || row.status === "cancelled"
        ? row.status
        : "expired",
    listing_limit: Number.isFinite(listingLimit) ? listingLimit : null,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    auto_renew: row.auto_renew,
    payment_id: typeof row.payment_id === "string" ? row.payment_id : null,
    metadata: isRecordObject(row.metadata) ? row.metadata : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toListingUsageRecord(
  row: Record<string, unknown>
): SellerPackageListingUsageRecord | null {
  if (typeof row.id !== "string" || typeof row.status !== "string") {
    return null;
  }

  return {
    id: row.id,
    status: row.status as ListingStatus,
  };
}

function toPaymentRecord(
  row: Record<string, unknown>
): SellerPackagePaymentRecord | null {
  const amount =
    typeof row.amount === "number"
      ? row.amount
      : typeof row.amount === "string"
        ? Number(row.amount)
        : NaN;

  if (
    typeof row.id !== "string" ||
    typeof row.reference !== "string" ||
    typeof row.provider !== "string" ||
    !Number.isFinite(amount) ||
    typeof row.currency !== "string" ||
    typeof row.status !== "string" ||
    typeof row.purpose !== "string" ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    reference: row.reference,
    provider:
      row.provider === "stripe" || row.provider === "mpesa" || row.provider === "manual"
        ? row.provider
        : "manual",
    amount,
    currency: row.currency,
    status:
      row.status === "pending" ||
      row.status === "succeeded" ||
      row.status === "failed" ||
      row.status === "refunded"
        ? row.status
        : "failed",
    purpose: row.purpose,
    metadata: isRecordObject(row.metadata) ? row.metadata : null,
    created_at: row.created_at,
  };
}

export function getSellerPackagePlan(planId: string | null | undefined) {
  if (!planId) {
    return null;
  }

  return SELLER_PACKAGE_PLAN_MAP.get(planId as SellerPackagePlanId) ?? null;
}

export function isSellerPackageEntitlementActive(
  entitlement: SellerPackageEntitlementRecord | null | undefined,
  referenceDate = new Date()
) {
  if (!entitlement || entitlement.status !== "active") {
    return false;
  }

  const startTime = new Date(entitlement.starts_at).getTime();
  const endTime = new Date(entitlement.ends_at).getTime();
  const now = referenceDate.getTime();

  return Number.isFinite(startTime) && Number.isFinite(endTime) && startTime <= now && endTime > now;
}

export function formatSellerPackageRenewalDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return MEMBERSHIP_DATE_FORMATTER.format(date);
}

export function deriveSellerPackageAccessState(
  entitlements: SellerPackageEntitlementRecord[],
  listingUsage: SellerPackageListingUsageRecord[],
  options?: {
    ignoreListingId?: string | null;
    referenceDate?: Date;
  }
): SellerPackageAccessState {
  const referenceDate = options?.referenceDate ?? new Date();
  const ignoreListingId = options?.ignoreListingId ?? null;
  const activeEntitlement =
    entitlements.find((entitlement) =>
      isSellerPackageEntitlementActive(entitlement, referenceDate)
    ) ?? null;
  const currentPlan = getSellerPackagePlan(activeEntitlement?.plan_id);

  if (!activeEntitlement || !currentPlan) {
    return {
      ...EMPTY_PACKAGE_ACCESS,
      usedListings: listingUsage.filter((listing) => listing.id !== ignoreListingId).length,
    };
  }

  const usedListings = listingUsage.filter((listing) => listing.id !== ignoreListingId).length;
  const listingLimit =
    activeEntitlement.listing_limit ?? currentPlan.listingLimit ?? null;
  const remainingListings =
    listingLimit === null ? null : Math.max(listingLimit - usedListings, 0);

  return {
    activeEntitlement,
    currentPlan,
    usedListings,
    listingLimit,
    remainingListings,
    hasActivePlan: true,
    canCreateListing: remainingListings === null || remainingListings > 0,
    renewalDateLabel: formatSellerPackageRenewalDate(activeEntitlement.ends_at),
    billingCycleLabel: "Monthly",
  };
}

export async function getSellerMembershipDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<SellerMembershipDashboardData> {
  const [entitlementsResult, listingsResult, paymentsResult] = await Promise.all([
    supabase
      .from("seller_package_entitlements")
      .select(
        "id, user_id, plan_id, status, listing_limit, starts_at, ends_at, auto_renew, payment_id, metadata, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("starts_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, status")
      .eq("seller_id", userId)
      .in("status", [...SELLER_PACKAGE_USAGE_STATUSES]),
    supabase
      .from("payments")
      .select("id, reference, provider, amount, currency, status, purpose, metadata, created_at")
      .eq("user_id", userId)
      .eq("purpose", "subscription")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (entitlementsResult.error) {
    throw new Error(entitlementsResult.error.message);
  }

  if (listingsResult.error) {
    throw new Error(listingsResult.error.message);
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
  }

  const entitlements = (entitlementsResult.data ?? [])
    .map((row) => toPackageEntitlementRecord(row as Record<string, unknown>))
    .filter((row): row is SellerPackageEntitlementRecord => Boolean(row));
  const listingUsage = (listingsResult.data ?? [])
    .map((row) => toListingUsageRecord(row as Record<string, unknown>))
    .filter((row): row is SellerPackageListingUsageRecord => Boolean(row));
  const paymentHistory = (paymentsResult.data ?? [])
    .map((row) => toPaymentRecord(row as Record<string, unknown>))
    .filter((row): row is SellerPackagePaymentRecord => Boolean(row));

  return {
    plans: SELLER_PACKAGE_PLANS,
    access: deriveSellerPackageAccessState(entitlements, listingUsage),
    entitlements,
    paymentHistory,
  };
}

export async function getSellerPackageAccessForUser(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    ignoreListingId?: string | null;
  }
) {
  const [entitlementsResult, listingsResult] = await Promise.all([
    supabase
      .from("seller_package_entitlements")
      .select(
        "id, user_id, plan_id, status, listing_limit, starts_at, ends_at, auto_renew, payment_id, metadata, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("starts_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, status")
      .eq("seller_id", userId)
      .in("status", [...SELLER_PACKAGE_USAGE_STATUSES]),
  ]);

  if (entitlementsResult.error) {
    return { error: entitlementsResult.error.message, access: EMPTY_PACKAGE_ACCESS };
  }

  if (listingsResult.error) {
    return { error: listingsResult.error.message, access: EMPTY_PACKAGE_ACCESS };
  }

  const entitlements = (entitlementsResult.data ?? [])
    .map((row) => toPackageEntitlementRecord(row as Record<string, unknown>))
    .filter((row): row is SellerPackageEntitlementRecord => Boolean(row));
  const listingUsage = (listingsResult.data ?? [])
    .map((row) => toListingUsageRecord(row as Record<string, unknown>))
    .filter((row): row is SellerPackageListingUsageRecord => Boolean(row));

  return {
    error: null,
    access: deriveSellerPackageAccessState(entitlements, listingUsage, options),
  };
}
