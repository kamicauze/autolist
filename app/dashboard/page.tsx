import { ListOrdered, Clock, Heart, Star } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { ListingsTable } from "@/components/dashboard/listings-table";
import { PageInsightsChart } from "@/components/dashboard/page-insights-chart";
import { RecentReviews } from "@/components/dashboard/recent-reviews";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here&apos;s an overview of your activity.
        </p>
      </div>

      {/* Verification Banner */}
      <VerificationBanner />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Your Listing"
          value="19"
          icon={ListOrdered}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatsCard
          label="Pending"
          value="3"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatsCard
          label="Favorites"
          value="42"
          icon={Heart}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />
        <StatsCard
          label="Reviews"
          value="18"
          icon={Star}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />
      </div>

      {/* Chart + Reviews Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PageInsightsChart />
        </div>
        <RecentReviews />
      </div>

      {/* Listings Table */}
      <ListingsTable />
    </div>
  );
}
