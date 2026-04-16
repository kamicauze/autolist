import {
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import type { AdminUsersOverviewData } from "@/lib/data/admin";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleTone(role: string) {
  if (role === "admin" || role === "support") return "amber" as const;
  if (role === "dealer") return "green" as const;
  if (role === "seller") return "blue" as const;
  return "slate" as const;
}

function dealerTone(status: string | null) {
  if (status === "APPROVED") return "green" as const;
  if (status === "PENDING") return "amber" as const;
  if (status === "REJECTED") return "red" as const;
  return "slate" as const;
}

export function AdminUsersLive({ data }: { data: AdminUsersOverviewData }) {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Users" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Total users"
          value={data.stats.total.toLocaleString("en-KE")}
          icon={<Users className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Buyers"
          value={data.stats.buyers.toLocaleString("en-KE")}
          icon={<UserRound className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Sellers + dealers"
          value={(data.stats.sellers + data.stats.dealers).toLocaleString("en-KE")}
          icon={<Store className="h-5 w-5" />}
          note={`${data.stats.pendingDealers} dealer applications pending`}
        />
        <AdminStatCard
          label="Staff"
          value={data.stats.staff.toLocaleString("en-KE")}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        title="Latest Accounts"
        description="Recent profiles with live role and inventory context."
      >
        <AdminDataTable columns={["User", "Role", "Dealer status", "Listings", "Joined"]}>
          {data.users.map((user) => (
            <tr key={user.id} className="border-b border-[#f1f5f9] last:border-b-0">
              <td className="px-6 py-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{user.name}</p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">{user.email || "No email"}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <AdminStatusPill label={user.role} tone={roleTone(user.role)} />
              </td>
              <td className="px-6 py-4">
                {user.dealerStatus ? (
                  <AdminStatusPill
                    label={user.dealerStatus.toLowerCase()}
                    tone={dealerTone(user.dealerStatus)}
                  />
                ) : (
                  <span className="text-[12px] text-[#94a3b8]">Not a dealer</span>
                )}
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
    </div>
  );
}
