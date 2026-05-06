import Link from "next/link";
import {
  ArrowUpRight,
  CircleDollarSign,
  FileWarning,
  MessageSquareText,
  Users,
} from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
} from "@/components/admin/admin-ui";
import type { AdminDashboardData } from "@/lib/data/admin";

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

function ticketStatusTone(status: string) {
  if (status === "open" || status === "triaged") return "amber" as const;
  if (status === "resolved" || status === "closed") return "green" as const;
  return "blue" as const;
}

function priorityTone(priority: string) {
  if (priority === "urgent" || priority === "high") return "red" as const;
  if (priority === "medium") return "amber" as const;
  return "slate" as const;
}

function roleTone(role: string) {
  if (role === "admin" || role === "support") return "amber" as const;
  if (role === "dealer") return "green" as const;
  if (role === "seller") return "blue" as const;
  return "slate" as const;
}

export function AdminDashboardLive({ data }: { data: AdminDashboardData }) {
  const statCards = [
    { ...data.metrics.totalListings, icon: <CircleDollarSign className="h-5 w-5" /> },
    { ...data.metrics.pendingListings, icon: <FileWarning className="h-5 w-5" /> },
    { ...data.metrics.totalUsers, icon: <Users className="h-5 w-5" /> },
    { ...data.metrics.supportQueue, icon: <MessageSquareText className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        action={
          <Link href="/admin/review" className={adminGhostButtonClass}>
            Open moderation queue
          </Link>
        }
      />

      <div data-tour="admin-dashboard-stats" className="grid gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <AdminStatCard
            key={card.label}
            label={card.label}
            value={card.value.toLocaleString("en-KE")}
            icon={card.icon}
            note={card.note}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AdminSectionCard
          title="Recent Listings"
          description="Latest marketplace changes across private sellers and dealers."
          action={
            <Link href="/admin/listings" className={adminGhostButtonClass}>
              View all listings
            </Link>
          }
        >
          <AdminDataTable columns={["Listing", "Seller", "Status", "Price", "Created", ""]}>
            {data.recentListings.map((listing) => (
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

        <AdminSectionCard
          title="Pending Dealer Verification"
          description="Newest dealers still waiting on approval."
          action={
            <Link href="/admin/verification" className={adminGhostButtonClass}>
              Open KYC queue
            </Link>
          }
        >
          <div className="space-y-4">
            {data.pendingDealers.length > 0 ? (
              data.pendingDealers.map((dealer) => (
                <div
                  key={dealer.id}
                  className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#111827]">{dealer.name}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {dealer.contactName}
                        {dealer.contactEmail ? ` • ${dealer.contactEmail}` : ""}
                      </p>
                    </div>
                    <AdminStatusPill label="Pending" tone="amber" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-[#6b7280]">
                    <span>{dealer.city || "City not set"}</span>
                    <span>{formatDate(dealer.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-[13px] text-[#6b7280]">
                No dealers are waiting on review.
              </div>
            )}
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <AdminSectionCard
          title="Newest Users"
          description="Recent account creation across marketplace roles."
          action={
            <Link href="/admin/users" className={adminGhostButtonClass}>
              View all users
            </Link>
          }
        >
          <AdminDataTable columns={["User", "Role", "Listings", "Joined"]}>
            {data.recentUsers.map((user) => (
              <tr key={user.id} className="border-b border-[#f1f5f9] last:border-b-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827]">{user.name}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{user.email || "No email"}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminStatusPill label={user.role} tone={roleTone(user.role)} />
                    {user.dealerStatus ? (
                      <AdminStatusPill
                        label={user.dealerStatus.toLowerCase()}
                        tone={user.dealerStatus === "APPROVED" ? "green" : user.dealerStatus === "PENDING" ? "amber" : "red"}
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-[#111827]">
                  {user.listingCount} total
                  <span className="block text-[12px] text-[#6b7280]">{user.activeListingCount} active</span>
                </td>
                <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(user.joinedAt)}</td>
              </tr>
            ))}
          </AdminDataTable>
        </AdminSectionCard>

        <AdminSectionCard
          title="Support Snapshot"
          description="Newest issues requiring staff handling."
          action={
            <Link href="/admin/car-inquiries" className={adminGhostButtonClass}>
              Open support queue
            </Link>
          }
        >
          <div className="space-y-4">
            {data.recentTickets.length > 0 ? (
              data.recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">{ticket.subject}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {ticket.assignedTo ? `Assigned to ${ticket.assignedTo}` : "Unassigned"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <AdminStatusPill label={ticket.priority} tone={priorityTone(ticket.priority)} />
                      <AdminStatusPill
                        label={ticket.status.replace(/_/g, " ")}
                        tone={ticketStatusTone(ticket.status)}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] text-[#6b7280]">{formatDate(ticket.updatedAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-[13px] text-[#6b7280]">
                No open support activity right now.
              </div>
            )}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
