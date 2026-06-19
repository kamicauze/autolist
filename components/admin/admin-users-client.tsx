"use client";

import * as React from "react";
import { Download, Eye, Plus, Ban, ShieldCheck, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminInputClass,
  adminMetricIcons,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminSurfaceClass,
} from "./admin-ui";

type UserRow = {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: "Seller" | "Buyer" | "Admin" | "Dealer" | "Agent";
  status: "Active" | "Suspended" | "Pending";
  verification: "Verified" | "Not Verified";
  listings: number;
  joined: string;
};

const userRows: UserRow[] = [
  {
    id: "1",
    initials: "MC",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    role: "Seller",
    status: "Active",
    verification: "Verified",
    listings: 12,
    joined: "Jan 15, 2026",
  },
  {
    id: "2",
    initials: "SJ",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "Buyer",
    status: "Active",
    verification: "Verified",
    listings: 0,
    joined: "Feb 22, 2026",
  },
  {
    id: "3",
    initials: "DM",
    name: "David Miller",
    email: "david.m@email.com",
    role: "Seller",
    status: "Active",
    verification: "Not Verified",
    listings: 3,
    joined: "Mar 5, 2026",
  },
  {
    id: "4",
    initials: "EW",
    name: "Emma Williams",
    email: "emma.w@email.com",
    role: "Admin",
    status: "Active",
    verification: "Verified",
    listings: 0,
    joined: "Dec 10, 2025",
  },
  {
    id: "5",
    initials: "JB",
    name: "James Brown",
    email: "james.b@email.com",
    role: "Seller",
    status: "Suspended",
    verification: "Verified",
    listings: 8,
    joined: "Jan 28, 2026",
  },
  {
    id: "6",
    initials: "LA",
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    role: "Buyer",
    status: "Active",
    verification: "Verified",
    listings: 0,
    joined: "Mar 12, 2026",
  },
  {
    id: "7",
    initials: "RT",
    name: "Robert Taylor",
    email: "robert.t@email.com",
    role: "Seller",
    status: "Pending",
    verification: "Not Verified",
    listings: 1,
    joined: "Mar 18, 2026",
  },
  {
    id: "8",
    initials: "JD",
    name: "Jennifer Davis",
    email: "jennifer.d@email.com",
    role: "Buyer",
    status: "Active",
    verification: "Verified",
    listings: 0,
    joined: "Feb 5, 2026",
  },
];

function roleTone(role: UserRow["role"]) {
  if (role === "Admin") return "amber" as const;
  if (role === "Seller") return "blue" as const;
  if (role === "Dealer") return "green" as const;
  return "slate" as const;
}

function statusTone(status: UserRow["status"]) {
  if (status === "Active") return "green" as const;
  if (status === "Pending") return "amber" as const;
  return "red" as const;
}

export function AdminUsersClient() {
  const [rows] = React.useState(userRows);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("All Roles");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [showModal, setShowModal] = React.useState(false);

  const filteredRows = rows.filter((row) => {
    const matchesQuery =
      row.name.toLowerCase().includes(query.toLowerCase()) ||
      row.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || row.role === roleFilter;
    const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Management"
        action={
          <button type="button" className={adminGhostButtonClass}>
            <Download className="h-4 w-4" />
            Export Users
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard label="Total Users" value="14,234" icon={adminMetricIcons.users} />
        <AdminStatCard label="Active Users" value="100" icon={adminMetricIcons.users} note="+15%" />
        <AdminStatCard label="Pending Verification" value="10" icon={adminMetricIcons.kyc} />
        <AdminStatCard label="Suspended" value="12,540" icon={adminMetricIcons.warning} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 md:grid-cols-[320px_140px_140px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email..."
              className={adminInputClass}
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className={adminSelectClass}
            >
              {["All Roles", "Buyer", "Seller", "Admin", "Dealer", "Agent"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={adminSelectClass}
            >
              {["All Status", "Active", "Pending", "Suspended"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <button type="button" onClick={() => setShowModal(true)} className={adminPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            Add Users
          </button>
        </div>

        <AdminDataTable
          columns={["", "User", "Role", "Status", "Verification", "Listings", "Joined", "Actions"]}
          footer={<AdminPagination label="Showing 3 to 8 of 24,387 users" />}
        >
          {filteredRows.map((row) => (
            <tr key={row.id} className="border-b border-[#f1f5f9] last:border-b-0">
              <td className="px-6 py-4">
                <input type="checkbox" className="h-4 w-4 rounded border-[#d1d5db]" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5e7eb] text-[12px] font-semibold text-[#6b7280]">
                    {row.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#111827]">{row.name}</p>
                    <p className="text-[12px] text-[#94a3b8]">{row.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <AdminStatusPill label={row.role} tone={roleTone(row.role)} />
              </td>
              <td className="px-6 py-4">
                <AdminStatusPill label={row.status} tone={statusTone(row.status)} />
              </td>
              <td className="px-6 py-4">
                <div className="inline-flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <ShieldCheck className={`h-4 w-4 ${row.verification === "Verified" ? "text-[#10b981]" : "text-[#f59e0b]"}`} />
                  {row.verification}
                </div>
              </td>
              <td className="px-6 py-4 text-[14px] text-[#374151]">{row.listings}</td>
              <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.joined}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3 text-[#6b7280]">
                  <button type="button" aria-label="View user" className="hover:text-primary">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Verify user" className="hover:text-[#10b981]">
                    <ShieldCheck className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Suspend user" className="hover:text-[#ef4444]">
                    <Ban className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 px-4">
          <div className={cn(adminSurfaceClass, "w-full max-w-[480px] p-6")}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-[28px] font-semibold text-[#111827]">Add New User</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-[#9ca3af] hover:text-[#111827]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Full Name *</label>
                <input className={adminInputClass} placeholder="Enter full name" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Email Address *</label>
                <input className={adminInputClass} placeholder="user@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Phone Number</label>
                <input className={adminInputClass} placeholder="+254 712 345 678" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Role</label>
                <select className={adminSelectClass}>
                  {["Buyer", "Seller", "Admin", "Dealer", "Agent"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Status</label>
                <select className={adminSelectClass}>
                  {["Active", "Pending", "Suspended"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-[#374151]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#d1d5db]" />
                Mark as verified
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className={adminGhostButtonClass}>
                Cancel
              </button>
              <button type="button" className={adminPrimaryButtonClass}>
                <UserPlus className="h-4 w-4" />
                Add User
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
