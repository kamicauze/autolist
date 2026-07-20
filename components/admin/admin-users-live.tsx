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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import type { AdminUsersOverviewData } from "@/lib/data/admin";
import {
  ADMIN_USER_CATEGORIES,
  filterAdminUsers,
  getAdminUserCategory,
  type AdminUserCategory,
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

function roleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AdminUsersLive({ data }: { data: AdminUsersOverviewData }) {
  const [filters, setFilters] = React.useState<AdminUsersFilterState>({
    category: "dealer",
    query: "",
    role: "all",
    dealerStatus: "all",
    listingActivity: "all",
  });

  const filteredUsers = React.useMemo(
    () => filterAdminUsers(data.users, filters),
    [data.users, filters]
  );

  const categoryCounts = React.useMemo(
    () =>
      data.users.reduce<Record<AdminUserCategory, number>>(
        (counts, user) => {
          counts[getAdminUserCategory(user)] += 1;
          return counts;
        },
        { dealer: 0, private_seller: 0, buyer: 0, staff: 0 }
      ),
    [data.users]
  );

  const activeCategory =
    ADMIN_USER_CATEGORIES.find((category) => category.value === filters.category) ??
    ADMIN_USER_CATEGORIES[0];

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
      category: filters.category,
      query: "",
      role: "all",
      dealerStatus: "all",
      listingActivity: "all",
    });
  };

  const changeCategory = (category: AdminUserCategory) => {
    setFilters((current) => ({
      category,
      query: current.query,
      role: "all",
      dealerStatus: "all",
      listingActivity: "all",
    }));
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Users" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Dealers"
          value={categoryCounts.dealer.toLocaleString("en-KE")}
          icon={<Store className="h-5 w-5" />}
          note={`${data.stats.pendingDealers} applications pending`}
        />
        <AdminStatCard
          label="Private sellers"
          value={categoryCounts.private_seller.toLocaleString("en-KE")}
          icon={<UserRound className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Buyers"
          value={categoryCounts.buyer.toLocaleString("en-KE")}
          icon={<Users className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Staff"
          value={categoryCounts.staff.toLocaleString("en-KE")}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        title={`${activeCategory.label} accounts`}
        description={`Browse the latest ${activeCategory.label.toLowerCase()} with live account and inventory context.`}
      >
        <Tabs
          value={filters.category}
          onValueChange={(value) => changeCategory(value as AdminUserCategory)}
          className="mb-5 w-full"
        >
          <div className="-mx-1 overflow-x-auto px-1 pb-2">
            <TabsList className="h-auto min-w-max justify-start gap-2 bg-[#f8fafc] p-1.5">
              {ADMIN_USER_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="gap-2 rounded-[8px] px-4 py-2.5 text-[13px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {category.label}
                  <span className="rounded-full bg-[#e5e7eb] px-2 py-0.5 text-[11px] text-[#4b5563]">
                    {categoryCounts[category.value].toLocaleString("en-KE")}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <input
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="Search name, email, role..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
            />
          </label>

          {filters.category === "staff" ? (
            <select
              value={filters.role}
              onChange={(event) => updateFilter("role", event.target.value)}
              className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
              aria-label="Filter staff by role"
            >
              <option value="all">All staff roles</option>
              <option value="sales_agent">Sales agents</option>
              <option value="support">Support</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super admins</option>
            </select>
          ) : null}

          {filters.category === "dealer" ? (
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
            </select>
          ) : null}

          {filters.category === "dealer" || filters.category === "private_seller" ? (
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
          ) : null}

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d1d5db] bg-white px-4 text-[13px] font-semibold text-[#374151] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#6b7280]">
          <span>
            Showing {filteredUsers.length.toLocaleString("en-KE")} of{" "}
            {categoryCounts[filters.category].toLocaleString("en-KE")} loaded{" "}
            {activeCategory.label.toLowerCase()}
          </span>
          {hasActiveFilters ? (
            <span className="font-medium text-primary">Filters active</span>
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
                      className="text-[14px] font-semibold text-[#111827] transition hover:text-primary"
                    >
                      {user.name}
                    </Link>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{user.email || "No email"}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <AdminStatusPill label={roleLabel(user.role)} tone={roleTone(user.role)} />
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
                    className="font-medium text-primary transition hover:text-brand-hover"
                  >
                    View history
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-[#6b7280]">
                No {activeCategory.label.toLowerCase()} match the current search or filters.
              </td>
            </tr>
          )}
        </AdminDataTable>
      </AdminSectionCard>
    </div>
  );
}
