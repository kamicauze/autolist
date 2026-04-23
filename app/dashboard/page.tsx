import Link from "next/link";
import { CheckCircle2, Clock3, FileText, ListOrdered } from "lucide-react";
import { ListingsTable } from "@/components/dashboard/listings-table";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { getMyListings } from "@/lib/actions/listings";
import {
  SellerPageHeader,
  SellerSurface,
  SellerStatCard,
} from "@/components/dashboard/seller-dashboard-ui";

export default async function DashboardPage() {
  const { data: listings } = await getMyListings();
  const listingItems = listings || [];
  const recentListings = listingItems.slice(0, 5);

  const dashboardStats = [
    {
      label: "Total listings",
      value: String(listingItems.length),
      icon: <ListOrdered className="h-5 w-5 text-[#2563eb]" />,
      accentClass: "bg-[#eef4ff]",
    },
    {
      label: "Active",
      value: String(listingItems.filter((listing) => listing.status === "active").length),
      icon: <CheckCircle2 className="h-5 w-5 text-[#2f9e63]" />,
      accentClass: "bg-[#eaf7ef]",
    },
    {
      label: "Pending review",
      value: String(listingItems.filter((listing) => listing.status === "pending").length),
      icon: <Clock3 className="h-5 w-5 text-[#f79009]" />,
      accentClass: "bg-[#fff3e4]",
    },
    {
      label: "Drafts",
      value: String(listingItems.filter((listing) => listing.status === "draft").length),
      icon: <FileText className="h-5 w-5 text-[#7c3aed]" />,
      accentClass: "bg-[#f4efff]",
    },
  ];

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

      <SellerSurface className="p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
              Available Now
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b7280]">
              This dashboard now shows live listing totals only. Messaging, verification, and
              account security stay available through their dedicated pages while the remaining
              seller dashboard modules are being wired to real data.
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
