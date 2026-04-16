import { Bell, Heart, ListOrdered, MessageCircle } from "lucide-react";
import { ListingsTable } from "@/components/dashboard/listings-table";
import { PageInsightsChart } from "@/components/dashboard/page-insights-chart";
import { RecentReviews } from "@/components/dashboard/recent-reviews";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { getMyListings } from "@/lib/actions/listings";
import {
  SellerPageHeader,
  SellerStatCard,
} from "@/components/dashboard/seller-dashboard-ui";

const dashboardStats = [
  {
    label: "Your Listing",
    value: "54",
    icon: <ListOrdered className="h-5 w-5 text-[#2563eb]" />,
    accentClass: "bg-[#eef4ff]",
  },
  {
    label: "Message",
    value: "21",
    icon: <MessageCircle className="h-5 w-5 text-[#2f9e63]" />,
    accentClass: "bg-[#eaf7ef]",
  },
  {
    label: "My Favorites",
    value: "39",
    icon: <Heart className="h-5 w-5 text-[#f04438]" />,
    accentClass: "bg-[#fff0ef]",
  },
  {
    label: "Review",
    value: "18",
    icon: <Bell className="h-5 w-5 text-[#f79009]" />,
    accentClass: "bg-[#fff3e4]",
  },
];

export default async function DashboardPage() {
  const { data: listings } = await getMyListings();
  const recentListings = (listings || []).slice(0, 5);

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Dashboard"
        description="Track listing activity, monitor buyer engagement, and keep your seller account in good standing."
      />

      <VerificationBanner />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <SellerStatCard key={item.label} {...item} />
        ))}
      </div>

      <ListingsTable listings={recentListings} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <PageInsightsChart />
        <RecentReviews />
      </div>
    </div>
  );
}
