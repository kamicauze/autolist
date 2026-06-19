import Link from "next/link";
import { Clock3, Heart, ListOrdered, Star } from "lucide-react";
import { PageInsightsChart } from "@/components/dashboard/page-insights-chart";
import { ListingsTable } from "@/components/dashboard/listings-table";
import { RecentReviews } from "@/components/dashboard/recent-reviews";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { PublicCmsBannerPlacement } from "@/components/cms/public-cms-banners";
import { getMyListings } from "@/lib/actions/listings";
import { createClient } from "@/lib/supabase/server";
import { getSellerPackageAccessForUser } from "@/lib/data/membership";
import { getSellerDashboardReviewsData } from "@/lib/data/reviews";
import {
  SellerPageHeader,
  SellerSurface,
  SellerStatCard,
} from "@/components/dashboard/seller-dashboard-ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listingsResult, packageAccessResult, favoritesResult, reviewsData] = await Promise.all([
    getMyListings(),
    user
      ? getSellerPackageAccessForUser(supabase, user.id)
      : Promise.resolve({ error: "Unauthorized", access: null }),
    user
      ? supabase
          .from("wishlists")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
      : Promise.resolve({ count: 0 }),
    getSellerDashboardReviewsData(),
  ]);

  const { data: listings } = listingsResult;
  const listingItems = listings || [];
  const recentListings = listingItems.slice(0, 5);
  const packageAccess = packageAccessResult.access;
  const activeOrPendingListings = listingItems.filter((listing) =>
    ["active", "pending", "reserved"].includes(listing.status)
  ).length;
  const quotaValue =
    packageAccess?.remainingListings === null
      ? `${activeOrPendingListings}/unlimited`
      : packageAccess?.listingLimit
        ? `${packageAccess.remainingListings}/${packageAccess.listingLimit} remaining`
        : "0/0 remaining";

  const dashboardStats = [
    {
      label: "Your listing",
      value: quotaValue,
      icon: <ListOrdered className="h-5 w-5 text-primary" />,
      accentClass: "bg-brand-tint",
      note: packageAccess?.currentPlan ? packageAccess.currentPlan.name : "No active package",
    },
    {
      label: "Pending",
      value: String(listingItems.filter((listing) => listing.status === "pending").length),
      icon: <Clock3 className="h-5 w-5 text-[#f79009]" />,
      accentClass: "bg-[#fff3e4]",
    },
    {
      label: "Favorites",
      value: String(favoritesResult.count ?? 0).padStart(2, "0"),
      icon: <Heart className="h-5 w-5 text-primary" />,
      accentClass: "bg-brand-tint",
    },
    {
      label: "Reviews",
      value:
        reviewsData.summary.totalReviews > 0
          ? reviewsData.summary.averageRating.toLocaleString("en-KE", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })
          : "0",
      icon: <Star className="h-5 w-5 text-primary" />,
      accentClass: "bg-brand-tint",
      note:
        reviewsData.summary.totalReviews === 1
          ? "1 review"
          : `${reviewsData.summary.totalReviews} reviews`,
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Dashboard"
        description="Track seller listings, package capacity, buyer engagement, and account verification."
      />

      <VerificationBanner />

      <PublicCmsBannerPlacement
        placement="dashboard"
        variant="compact"
        className="px-0 py-0"
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <SellerStatCard key={item.label} {...item} />
        ))}
      </div>

      <ListingsTable listings={recentListings} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PageInsightsChart />
        <RecentReviews reviews={reviewsData.reviews.slice(0, 4)} />
      </div>

      <SellerSurface className="p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Seller workspace
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b7280]">
              Seller tools stay focused on listing publishing, messages, reviews, favorites,
              profile, membership, and account verification. Dealer team tools are only shown to
              dealer accounts.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                href: "/dashboard/messages",
                label: "Open Messages",
                description: "Respond to live buyer threads.",
              },
              {
                href: "/dashboard/verification",
                label: "Review Verification",
                description: "Track KYC status and requirements.",
              },
              {
                href: "/dashboard/profile",
                label: "View Account",
                description: "Check the authenticated seller profile.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[18px] border border-[#e5e7eb] bg-[#faf9f7] px-4 py-4 transition hover:border-[#cbd5e1] hover:bg-white"
              >
                <p className="text-[14px] font-semibold text-[#202224]">{item.label}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </SellerSurface>
    </div>
  );
}
