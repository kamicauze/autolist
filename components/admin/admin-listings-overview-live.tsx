import Link from "next/link";
import { ArrowUpRight, CarFront, CheckCircle2, Clock3, XCircle } from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import type { AdminListingsOverviewData } from "@/lib/data/admin";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function listingStatusTone(status: string) {
  if (status === "active") return "green" as const;
  if (status === "pending") return "amber" as const;
  if (status === "rejected") return "red" as const;
  return "slate" as const;
}

export function AdminListingsOverviewLive({ data }: { data: AdminListingsOverviewData }) {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="All Listings" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="All listings"
          value={data.total.toLocaleString("en-KE")}
          icon={<CarFront className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Active"
          value={data.stats.active.toLocaleString("en-KE")}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Pending review"
          value={data.stats.pending.toLocaleString("en-KE")}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Rejected"
          value={data.stats.rejected.toLocaleString("en-KE")}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        title="Recent Listings"
        description="Live inventory across active, pending, sold, and expired states."
      >
        <AdminDataTable columns={["Listing", "Seller", "Status", "Price", "Created", ""]}>
          {data.listings.map((listing) => (
            <tr key={listing.id} className="border-b border-[#f1f5f9] last:border-b-0">
              <td className="px-6 py-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{listing.title}</p>
                  {listing.subtitle ? (
                    <p className="mt-1 text-[12px] text-[#6b7280]">{listing.subtitle}</p>
                  ) : null}
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-[13px] font-medium text-[#111827]">{listing.sellerName}</p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {listing.dealerName || listing.sellerType}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <AdminStatusPill
                  label={listing.status.replace(/_/g, " ")}
                  tone={listingStatusTone(listing.status)}
                />
              </td>
              <td className="px-6 py-4 text-[13px] text-[#111827]">
                {formatCurrency(listing.price, listing.currency)}
              </td>
              <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(listing.createdAt)}</td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/vehicle/${listing.id}`}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563eb]"
                >
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      </AdminSectionCard>
    </div>
  );
}
