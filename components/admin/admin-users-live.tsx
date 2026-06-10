"use client";

import * as React from "react";
import {
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import type { AdminUsersOverviewData } from "@/lib/data/admin";
import {
  filterAdminUsers,
  type AdminUsersFilterState,
} from "@/lib/data/admin-users-filter";

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
  const [filters, setFilters] = React.useState<AdminUsersFilterState>({
    query: "",
    role: "all",
    dealerStatus: "all",
    listingActivity: "all",
  });

  const filteredUsers = React.useMemo(
    () => filterAdminUsers(data.users, filters),
    [data.users, filters]
  );

  const hasActiveFilters =
    filters.query.trim().length > 0 ||
    filters.role !== "all" ||
    filters.dealerStatus !== "all" ||
    filters.listingActivity !== "all";

  const updateFilter = <Key extends keyof AdminUsersFilterState>(
    key: Key,
    value: AdminUsersFilterState[Key]
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      role: "all",
      dealerStatus: "all",
      listingActivity: "all",
    });
  };

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
        <div className="mb-5 grid gap-3 xl:grid-cols-[minmax(260px,1fr)_170px_190px_190px_auto]">
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <input
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="Search name, email, role..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
            />
          </label>

          <select
            value={filters.role}
            onChange={(event) => updateFilter("role", event.target.value)}
            className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
            aria-label="Filter users by role"
          >
            <option value="all">All roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="dealer">Dealers</option>
            <option value="sales_agent">Sales agents</option>
            <option value="support">Support</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super admins</option>
          </select>

          <select
            value={filters.dealerStatus}
            onChange={(event) =>
              updateFilter(
                "dealerStatus",
                event.target.value as AdminUsersFilterState["dealerStatus"]
              )
            }
            className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
            aria-label="Filter users by dealer status"
          >
            <option value="all">All dealer states</option>
            <option value="APPROVED">Approved dealers</option>
            <option value="PENDING">Pending dealers</option>
            <option value="REJECTED">Rejected dealers</option>
            <option value="none">No dealer record</option>
          </select>

          <select
            value={filters.listingActivity}
            onChange={(event) =>
              updateFilter(
                "listingActivity",
                event.target.value as AdminUsersFilterState["listingActivity"]
              )
            }
            className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
            aria-label="Filter users by listing activity"
          >
            <option value="all">All listing activity</option>
            <option value="with_listings">Has listings</option>
            <option value="active">Has active listings</option>
            <option value="none">No listings</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d1d5db] bg-white px-4 text-[13px] font-semibold text-[#374151] transition hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#6b7280]">
          <span>
            Showing {filteredUsers.length.toLocaleString("en-KE")} of{" "}
            {data.users.length.toLocaleString("en-KE")} loaded users
          </span>
          {hasActiveFilters ? (
            <span className="font-medium text-[#2563eb]">Filters active</span>
          ) : null}
        </div>

        <AdminDataTable columns={["User", "Role", "Dealer status", "Listings", "Joined", "Activity"]}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-[#f1f5f9] last:border-b-0">
                <td className="px-6 py-4">
                  <div>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-[14px] font-semibold text-[#111827] transition hover:text-[#2563eb]"
                    >
                      {user.name}
                    </Link>
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
                  <span className="block text-[12px] text-[#6b7280]">
                    {user.activeListingCount} active
                  </span>
                </td>
                <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(user.joinedAt)}</td>
                <td className="px-6 py-4 text-[13px]">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium text-[#2563eb] transition hover:text-[#1d4ed8]"
                  >
                    View history
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-[#6b7280]">
                No users match the current search or filters.
              </td>
            </tr>
          )}
        </AdminDataTable>
      </AdminSectionCard>
    </div>
  );
}
