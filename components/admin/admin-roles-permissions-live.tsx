"use client";

import * as React from "react";
import { Headset, ShieldCheck, UserCog, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  updateAdminUserRoleAction,
  updateRolePermissionAction,
} from "@/lib/actions/admin-roles";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminSurfaceClass,
} from "@/components/admin/admin-ui";
import type {
  AdminProfileRole,
  AdminRolesPermissionsData,
} from "@/lib/data/admin";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: Array<{ value: AdminProfileRole; label: string }> = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "dealer", label: "Dealer" },
  { value: "sales_agent", label: "Sales Agent" },
  { value: "support", label: "Support" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

type FeedbackState =
  | {
      status: "success" | "error";
      message: string;
    }
  | null;

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleTone(role: AdminProfileRole) {
  if (role === "super_admin") return "red" as const;
  if (role === "admin" || role === "support") return "amber" as const;
  if (role === "dealer") return "green" as const;
  if (role === "seller" || role === "sales_agent") return "blue" as const;
  return "slate" as const;
}

function dealerTone(status: string | null) {
  if (status === "APPROVED") return "green" as const;
  if (status === "PENDING") return "amber" as const;
  if (status === "REJECTED") return "red" as const;
  return "slate" as const;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Unknown error";
}

export function AdminRolesPermissionsLive({
  data,
  currentUserId,
  currentUserRole,
  feedback,
}: {
  data: AdminRolesPermissionsData;
  currentUserId: string;
  currentUserRole: AdminProfileRole;
  feedback: FeedbackState;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [feedbackState, setFeedbackState] = React.useState<FeedbackState>(feedback);
  const [users, setUsers] = React.useState(data.users);
  const [rolePermissions, setRolePermissions] = React.useState(data.rolePermissions);
  const canManageRoles = currentUserRole === "super_admin";

  React.useEffect(() => {
    setFeedbackState(feedback);
  }, [feedback]);

  React.useEffect(() => {
    setUsers(data.users);
  }, [data.users]);

  React.useEffect(() => {
    setRolePermissions(data.rolePermissions);
  }, [data.rolePermissions]);

  function handleRoleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const targetUserId = String(formData.get("userId") || "");
    const nextRole = String(formData.get("nextRole") || "") as AdminProfileRole;

    startTransition(async () => {
      try {
        const result = await updateAdminUserRoleAction(formData);

        if (result.success) {
          setUsers((currentUsers) =>
            currentUsers.map((user) =>
              user.id === targetUserId
                ? {
                    ...user,
                    role: nextRole,
                  }
                : user
            )
          );
          setFeedbackState({ status: "success", message: result.message });
          router.refresh();
          return;
        }

        setFeedbackState({ status: "error", message: result.error });
      } catch (error) {
        setFeedbackState({ status: "error", message: getErrorMessage(error) });
      }
    });
  }

  function handlePermissionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const role = String(formData.get("role") || "") as AdminProfileRole;
    const permissionKey = String(formData.get("permissionKey") || "");
    const enabled = String(formData.get("enabled") || "") === "true";

    startTransition(async () => {
      try {
        const result = await updateRolePermissionAction(formData);

        if (result.success) {
          setRolePermissions((currentPermissions) => {
            const nextPermissions = { ...currentPermissions };
            const permissionSet = new Set(nextPermissions[role] ?? []);

            if (enabled) {
              permissionSet.add(permissionKey);
            } else {
              permissionSet.delete(permissionKey);
            }

            nextPermissions[role] = Array.from(permissionSet);
            return nextPermissions;
          });
          setFeedbackState({ status: "success", message: result.message });
          router.refresh();
          return;
        }

        setFeedbackState({ status: "error", message: result.error });
      } catch (error) {
        setFeedbackState({ status: "error", message: getErrorMessage(error) });
      }
    });
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Roles & Permissions"
        action={
          <div className="rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] px-4 py-2 text-[12px] text-[#1d4ed8]">
            {canManageRoles
              ? "Super admin mode: role and permission changes are enabled."
              : "Read-only mode: super admin is required for role and permission changes."}
          </div>
        }
      />

      {feedbackState ? (
        <div
          className={cn(
            adminSurfaceClass,
            "px-5 py-4 text-[13px]",
            feedbackState.status === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          )}
        >
          {feedbackState.message}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Total accounts"
          value={data.stats.total.toLocaleString("en-KE")}
          icon={<Users className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Staff accounts"
          value={data.stats.staff.toLocaleString("en-KE")}
          icon={<UserCog className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Admin accounts"
          value={data.stats.admins.toLocaleString("en-KE")}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Support accounts"
          value={data.stats.supports.toLocaleString("en-KE")}
          icon={<Headset className="h-5 w-5" />}
          note={
            data.stats.pendingDealers > 0
              ? `${data.stats.pendingDealers} dealer reviews pending`
              : undefined
          }
        />
      </div>

      <AdminSectionCard
        title="Live Role Coverage"
        description="Current account split across the role values supported by the backend."
      >
        <div className="grid gap-4 xl:grid-cols-5">
          {data.roles.map((role) => (
            <div key={role.key} className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{role.label}</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">{role.description}</p>
                </div>
                <AdminStatusPill label={role.label} tone={role.tone} />
              </div>
              <p className="mt-4 font-heading text-[26px] font-semibold text-[#111827]">
                {role.count.toLocaleString("en-KE")}
              </p>
              <p className="mt-1 text-[12px] text-[#94a3b8]">
                {role.note || "Live count from public.profiles"}
              </p>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Role Assignments"
        description="Update the role directly on public.profiles. Super admins are protected from editing their own role."
      >
        <AdminDataTable columns={["User", "Current role", "Dealer status", "Listings", "Change role", "Joined"]}>
          {users.length > 0 ? (
            users.map((user) => {
              const isProtected = user.id === currentUserId;
              const disableRoleChange = isProtected || !canManageRoles;

              return (
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
                  <td className="px-6 py-4">
                    <form onSubmit={handleRoleSubmit} className="space-y-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                        <select
                          name="nextRole"
                          defaultValue={user.role}
                          disabled={disableRoleChange || isPending}
                          className={cn(adminSelectClass, "min-w-[148px] xl:w-[148px]")}
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={disableRoleChange || isPending}
                          className={cn(
                            adminPrimaryButtonClass,
                            "h-10 px-3 whitespace-nowrap",
                            (disableRoleChange || isPending) && "cursor-not-allowed opacity-60"
                          )}
                        >
                          Update role
                        </button>
                      </div>
                      {isProtected ? (
                        <p className="text-[11px] text-[#94a3b8]">Current admin session is protected.</p>
                      ) : !canManageRoles ? (
                        <p className="text-[11px] text-[#94a3b8]">Super admin required.</p>
                      ) : null}
                    </form>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(user.joinedAt)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#6b7280]">
                No profiles found yet.
              </td>
            </tr>
          )}
        </AdminDataTable>
      </AdminSectionCard>

      <AdminSectionCard
        title="Permission Matrix"
        description="Map platform permissions to each role. Super admin always keeps every permission."
      >
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-left">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[12px] uppercase tracking-[0.14em] text-[#6b7280]">
                <th className="px-4 py-3 font-semibold">Permission</th>
                {ROLE_OPTIONS.map((role) => (
                  <th key={role.value} className="px-3 py-3 text-center font-semibold">
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f7]">
              {data.permissions.map((permission) => (
                <tr key={permission.key}>
                  <td className="px-4 py-4">
                    <p className="text-[13px] font-semibold text-[#111827]">{permission.label}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{permission.description}</p>
                    <p className="mt-1 font-mono text-[11px] text-[#94a3b8]">{permission.key}</p>
                  </td>
                  {ROLE_OPTIONS.map((role) => {
                    const checked = rolePermissions[role.value]?.includes(permission.key) ?? false;
                    const locked = role.value === "super_admin" || !canManageRoles;

                    return (
                      <td key={`${role.value}-${permission.key}`} className="px-3 py-4 text-center">
                        <form onSubmit={handlePermissionSubmit}>
                          <input type="hidden" name="role" value={role.value} />
                          <input type="hidden" name="permissionKey" value={permission.key} />
                          <input type="hidden" name="enabled" value={checked ? "false" : "true"} />
                          <button
                            type="submit"
                            disabled={locked || isPending}
                            className={cn(
                              "mx-auto flex h-8 w-8 items-center justify-center rounded-[8px] border text-[13px] font-semibold transition",
                              checked
                                ? "border-[#2563eb] bg-[#2563eb] text-white"
                                : "border-[#d1d5db] bg-white text-[#94a3b8]",
                              locked || isPending
                                ? "cursor-not-allowed opacity-70"
                                : "hover:border-[#2563eb] hover:text-[#2563eb]"
                            )}
                            aria-label={`${checked ? "Disable" : "Enable"} ${permission.label} for ${role.label}`}
                          >
                            {checked ? "✓" : "-"}
                          </button>
                        </form>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>

      <div className="rounded-[14px] border border-dashed border-[#d1d5db] bg-[#f8fafc] px-5 py-4 text-[12px] leading-6 text-[#6b7280]">
        Dealer access still depends on the dealer application record. Changing a user to
        <span className="font-medium text-[#111827]"> dealer </span>
        does not create a dealer profile; sales-agent access is completed through the invite acceptance flow.
      </div>
    </div>
  );
}
