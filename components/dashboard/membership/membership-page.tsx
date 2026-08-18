"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarRange,
  CheckCircle2,
  ListChecks,
  WalletCards,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { activateSellerPackagePlan } from "@/lib/actions/membership";
import {
  SELLER_PACKAGE_PLANS,
  getSellerMembershipDashboardData,
  isDealerMembershipAccountRole,
} from "@/lib/data/membership";
import type {
  SellerMembershipDashboardData,
  SellerPackagePaymentProvider,
  SellerPackagePlan,
} from "@/lib/types/membership";
import {
  SellerPageHeader,
  SellerStatCard,
  SellerTabs,
} from "../seller-dashboard-ui";

const EMPTY_MEMBERSHIP_DATA: SellerMembershipDashboardData = {
  plans: SELLER_PACKAGE_PLANS,
  access: {
    activeEntitlement: null,
    currentPlan: null,
    usedListings: 0,
    listingLimit: 0,
    remainingListings: 0,
    hasActivePlan: false,
    canCreateListing: false,
    renewalDateLabel: null,
    billingCycleLabel: "Inactive",
  },
  entitlements: [],
  paymentHistory: [],
};

type MembershipAudience = "private_seller" | "dealer" | "sales_agent";

function formatPaymentAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPaymentProvider(provider: SellerPackagePaymentProvider) {
  if (provider === "mpesa") return "M-Pesa";
  if (provider === "stripe") return "card";
  return "manual activation";
}

async function loadMembershipForCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: EMPTY_MEMBERSHIP_DATA,
      error: "You need to sign in to manage seller packages.",
      audience: null,
    };
  }

  // Sales reps view their dealership's membership (read-only) when granted
  // billing.view. Their own linkage row is readable via RLS.
  const { data: repRow } = await supabase
    .from("dealer_sales_agents")
    .select("permissions, profile_id")
    .eq("agent_profile_id", user.id)
    .eq("status", "active")
    .eq("invite_status", "accepted")
    .maybeSingle<{ permissions: string[] | null; profile_id: string }>();

  if (repRow) {
    if (!Array.isArray(repRow.permissions) || !repRow.permissions.includes("billing.view")) {
      return {
        data: EMPTY_MEMBERSHIP_DATA,
        error: "You do not have access to dealership billing.",
        audience: "sales_agent" as const,
      };
    }
    const data = await getSellerMembershipDashboardData(supabase, repRow.profile_id);
    return { data, error: null, audience: "sales_agent" as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (profileError) {
    return {
      data: EMPTY_MEMBERSHIP_DATA,
      error: profileError.message,
      audience: null,
    };
  }

  const data = await getSellerMembershipDashboardData(supabase, user.id);
  return {
    data,
    error: null,
    audience: isDealerMembershipAccountRole(profile?.role)
      ? ("dealer" as const)
      : ("private_seller" as const),
  };
}

function getPlanButtonLabel({
  plan,
  activePlanId,
  hasActivePlan,
}: {
  plan: SellerPackagePlan;
  activePlanId: string | null;
  hasActivePlan: boolean;
}) {
  if (activePlanId === plan.id) {
    return "Current Plan";
  }

  if (hasActivePlan) {
    return "Switch Plan";
  }

  return "Choose Plan";
}

export function MembershipPage() {
  const [tab, setTab] = React.useState("packages");
  const [dashboardData, setDashboardData] =
    React.useState<SellerMembershipDashboardData>(EMPTY_MEMBERSHIP_DATA);
  const [isLoading, setIsLoading] = React.useState(true);
  const [audience, setAudience] = React.useState<MembershipAudience | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  React.useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const result = await loadMembershipForCurrentUser();
        if (!isMounted) return;

        setDashboardData(result.data);
        setLoadError(result.error);
        setAudience(result.audience);
      } catch (error) {
        if (!isMounted) return;

        setDashboardData(EMPTY_MEMBERSHIP_DATA);
        setAudience(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load membership details right now."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  const activePlanId = dashboardData.access.currentPlan?.id ?? null;
  const isIntroTrialActive =
    dashboardData.access.activeEntitlement?.metadata?.intro_trial === true;
  const membershipStats = [
    {
      label: "Available listing",
      value:
        dashboardData.access.remainingListings === null
          ? "Unlimited"
          : String(dashboardData.access.remainingListings ?? 0),
      icon: <BadgeCheck className="h-5 w-5 text-primary" />,
      accentClass: "bg-brand-tint",
      note: dashboardData.access.currentPlan
        ? `${dashboardData.access.currentPlan.name}${isIntroTrialActive ? " intro" : ""} plan`
        : "No active package",
    },
    {
      label: "Used listing",
      value: String(dashboardData.access.usedListings),
      icon: <ListChecks className="h-5 w-5 text-[#2f9e63]" />,
      accentClass: "bg-[#eaf7ef]",
      note: "Draft, pending, active, and reserved listings",
    },
    {
      label: "Renewal due",
      value: dashboardData.access.renewalDateLabel || "No plan",
      icon: <CalendarRange className="h-5 w-5 text-[#f79009]" />,
      accentClass: "bg-[#fff3e4]",
      note: dashboardData.access.hasActivePlan
        ? "Auto-renew is off"
        : "Activate a seller package",
    },
    {
      label: "Billing cycle",
      value: dashboardData.access.billingCycleLabel,
      icon: <WalletCards className="h-5 w-5 text-[#f04438]" />,
      accentClass: "bg-[#fff0ef]",
      note: dashboardData.access.currentPlan
        ? isIntroTrialActive
          ? "First 6 months are free"
          : `${dashboardData.access.currentPlan.priceLabel}${dashboardData.access.currentPlan.periodLabel}`
        : "No package charges recorded",
    },
  ];

  const handlePlanSelection = (planId: SellerPackagePlan["id"]) => {
    startTransition(async () => {
      setSelectedPlanId(planId);
      setActionError(null);
      setActionSuccess(null);

      const result = await activateSellerPackagePlan(planId);

      if (result.error) {
        setActionError(result.error);
        setSelectedPlanId(null);
        return;
      }

      try {
        const refreshed = await loadMembershipForCurrentUser();
        setDashboardData(refreshed.data);
        setLoadError(refreshed.error);
        setAudience(refreshed.audience);
        router.refresh();
        setActionSuccess(
          result.renewalDate
            ? `${result.planName} ${result.trialApplied ? "intro trial" : "package"} activated. ${result.trialApplied ? "Access runs through" : "Renewal due"} ${new Date(result.renewalDate).toLocaleDateString("en-KE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}.`
            : `${result.planName} activated.`
        );
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Package activated, but the dashboard could not refresh."
        );
      } finally {
        setSelectedPlanId(null);
      }
    });
  };

  if (isLoading && audience === null) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Membership"
          description="Loading the membership options for this account."
        />
        <div className="rounded-[28px] border border-[#ededed] bg-white px-6 py-12 text-center text-[14px] text-[#7a7a7a] shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
          Loading membership details...
        </div>
      </div>
    );
  }

  if (audience === null) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Membership"
          description="Membership options could not be matched to this account."
        />
        <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
          {loadError || "Unable to load membership details right now."}
        </div>
      </div>
    );
  }

  if (audience === "private_seller") {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Private seller access"
          description="Private listings are free during the pilot. Dealer membership prices do not apply to your account."
        />

        {loadError ? (
          <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
            {loadError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <SellerStatCard
            label="Listing access"
            value="Free during pilot"
            icon={<BadgeCheck className="h-5 w-5 text-primary" />}
            accentClass="bg-brand-tint"
            note="No dealer membership required"
          />
          <SellerStatCard
            label="Current listings"
            value={String(dashboardData.access.usedListings)}
            icon={<ListChecks className="h-5 w-5 text-[#2f9e63]" />}
            accentClass="bg-[#eaf7ef]"
            note="Draft, pending, active, and reserved listings"
          />
        </div>

        <section className="rounded-[28px] border border-[#ededed] bg-white p-6 shadow-[0_14px_44px_rgba(15,23,42,0.05)] lg:p-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
            Private seller
          </p>
          <h2 className="mt-3 font-heading text-[28px] font-semibold text-[#202224]">
            No paid package is needed
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#666]">
            You can create and submit private listings without activating a dealer plan. Paid private-seller visibility upgrades are not active in the product yet.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-[14px] bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-brand-hover"
          >
            Create a listing
          </Link>
        </section>
      </div>
    );
  }

  const canManagePlans = audience === "dealer";

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title={audience === "sales_agent" ? "Dealership membership" : "Dealer membership"}
        description={
          audience === "sales_agent"
            ? "Review the dealership package and recent billing activity. Sales reps have read-only access."
            : "Choose the package that fits your dealership inventory, compare coverage, and review recent billing activity."
        }
      />

      {(loadError || actionError || actionSuccess) ? (
        <div className="space-y-3">
          {loadError ? (
            <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
              {loadError}
            </div>
          ) : null}
          {actionError ? (
            <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
              {actionError}
            </div>
          ) : null}
          {actionSuccess ? (
            <div className="rounded-[18px] border border-[#d1fadf] bg-[#eefaf2] px-4 py-3 text-[14px] text-[#2f9e63]">
              {actionSuccess}
            </div>
          ) : null}
        </div>
      ) : null}

      {dashboardData.entitlements.length === 0 ? (
        <div className="rounded-[18px] border border-brand-muted-border bg-brand-soft-surface px-4 py-3 text-[14px] text-brand-hover">
          First activation on a seller account runs as a free 6-month intro membership.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {membershipStats.map((item) => (
          <SellerStatCard key={item.label} {...item} />
        ))}
      </div>

      <section className="rounded-[28px] border border-[#ededed] bg-white shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-[#ededed] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Membership Package
            </h2>
            <p className="mt-1 text-[13px] text-[#7a7a7a]">
              Select a plan for your seller account or review prior package payments.
            </p>
          </div>
          <SellerTabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "packages", label: "Membership package" },
              { value: "history", label: "Payment history" },
            ]}
          />
        </div>

        {tab === "packages" ? (
          <div className="grid gap-5 p-6 xl:grid-cols-3">
            {dashboardData.plans.map((plan, index) => {
              const isActive = activePlanId === plan.id;
              const highlighted = isActive || (!activePlanId && index === 1);

              return (
                <article
                  key={plan.id}
                  className={[
                    "rounded-[26px] border p-6 transition",
                    highlighted
                      ? "border-primary bg-brand-tint shadow-[0_18px_36px_rgb(var(--primary-rgb)/0.12)]"
                      : "border-[#ededed] bg-white",
                  ].join(" ")}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {isActive ? "Active package" : highlighted ? "Recommended" : "Seller package"}
                  </p>
                  <h3 className="mt-4 font-heading text-[28px] font-semibold text-[#202224]">
                    {plan.name}
                  </h3>
                  <p className="mt-4 font-heading text-[34px] font-semibold text-[#202224]">
                    {plan.priceLabel}
                    <span className="ml-1 text-[15px] font-medium text-[#7d7d7d]">
                      {plan.periodLabel}
                    </span>
                  </p>

                  {isActive ? (
                    <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-primary">
                      {isIntroTrialActive
                        ? "Free intro active"
                        : dashboardData.access.remainingListings === null
                          ? "Unlimited listing access"
                          : `${dashboardData.access.remainingListings ?? 0} listing slots left`}
                    </p>
                  ) : null}

                  <ul className="mt-6 space-y-3 text-[14px] leading-6 text-[#666]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={!canManagePlans || isLoading || isPending || isActive}
                    className={[
                      "mt-8 inline-flex h-12 w-full items-center justify-center rounded-[14px] text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                      highlighted
                        ? "bg-primary text-white hover:bg-brand-hover"
                        : "border border-[#d9d9d9] bg-white text-[#202224] hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    {!canManagePlans
                      ? "Read only"
                      : selectedPlanId === plan.id && isPending
                      ? "Activating..."
                      : getPlanButtonLabel({
                          plan,
                          activePlanId,
                          hasActivePlan: dashboardData.access.hasActivePlan,
                        })}
                  </button>
                </article>
              );
            })}
          </div>
        ) : dashboardData.paymentHistory.length > 0 ? (
          <div className="space-y-4 p-6">
            {dashboardData.paymentHistory.map((item) => {
              const planName =
                typeof item.metadata?.plan_name === "string"
                  ? item.metadata.plan_name
                  : "Seller Package";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-[#ededed] bg-[#faf9f7] p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="text-[16px] font-semibold text-[#202224]">{planName}</p>
                    <p className="mt-1 text-[13px] text-[#7a7a7a]">
                      Recorded on{" "}
                      {new Date(item.created_at).toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      via {formatPaymentProvider(item.provider)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-[24px] font-semibold text-[#202224]">
                      {formatPaymentAmount(item.amount, item.currency)}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2f9e63]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="font-heading text-[24px] font-semibold text-[#202224]">
              No payment history yet
            </p>
            <p className="mt-2 text-[14px] text-[#7a7a7a]">
              Activate a seller package to start recording package charges on this account.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
