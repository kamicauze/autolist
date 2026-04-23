import type { ListingStatus } from "@/lib/types/listing";

export type SellerPackagePlanId = "basic" | "professional" | "enterprise";

export type SellerPackageEntitlementStatus = "active" | "expired" | "cancelled";

export type SellerPackagePaymentProvider = "stripe" | "mpesa" | "manual";

export type SellerPackagePlan = {
  id: SellerPackagePlanId;
  name: string;
  priceKes: number;
  priceLabel: string;
  periodLabel: string;
  listingLimit: number | null;
  features: string[];
};

export type SellerPackageEntitlementRecord = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SellerPackageEntitlementStatus;
  listing_limit: number | null;
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  payment_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type SellerPackageListingUsageRecord = {
  id: string;
  status: ListingStatus;
};

export type SellerPackagePaymentRecord = {
  id: string;
  reference: string;
  provider: SellerPackagePaymentProvider;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  purpose: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type SellerPackageAccessState = {
  activeEntitlement: SellerPackageEntitlementRecord | null;
  currentPlan: SellerPackagePlan | null;
  usedListings: number;
  listingLimit: number | null;
  remainingListings: number | null;
  hasActivePlan: boolean;
  canCreateListing: boolean;
  renewalDateLabel: string | null;
  billingCycleLabel: string;
};

export type SellerMembershipDashboardData = {
  plans: SellerPackagePlan[];
  access: SellerPackageAccessState;
  entitlements: SellerPackageEntitlementRecord[];
  paymentHistory: SellerPackagePaymentRecord[];
};
