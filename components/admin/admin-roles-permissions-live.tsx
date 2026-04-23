import { Headset, ShieldCheck, UserCog, Users } from "lucide-react";
import { updateAdminUserRoleAction } from "@/lib/actions/admin-roles";
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
  { value: "support", label: "Support" },
  { value: "admin", label: "Admin" },
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

export function AdminRolesPermissionsLive({
  data,
  currentUserId,
  feedback,
}: {
  data: AdminRolesPermissionsData;
  currentUserId: string;
  feedback: FeedbackState;
}) {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Roles & Permissions"
        action={
          <div className="rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] px-4 py-2 text-[12px] text-[#1d4ed8]">
            Stage 1 uses live <span className="font-mono">profiles.role</span> only.
          </div>
        }
      />

      {feedback ? (
        <div
          className={cn(
            adminSurfaceClass,
            "px-5 py-4 text-[13px]",
            feedback.status === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          )}
        >
          {feedback.message}
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
        description="Current account split across the five role values already supported by the backend."
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
        description="Update the role directly on public.profiles. This does not create a dealer record or a permissions matrix."
      >
        <AdminDataTable columns={["User", "Current role", "Dealer status", "Listings", "Change role", "Joined"]}>
          {data.users.length > 0 ? (
            data.users.map((user) => {
              const isProtected = user.id === currentUserId;

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
                    <form action={updateAdminUserRoleAction} className="space-y-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                        <select
                          name="nextRole"
                          defaultValue={user.role}
                          disabled={isProtected}
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
                          disabled={isProtected}
                          className={cn(
                            adminPrimaryButtonClass,
                            "h-10 px-3 whitespace-nowrap",
                            isProtected && "cursor-not-allowed opacity-60"
                          )}
                        >
                          Update role
                        </button>
                      </div>
                      {isProtected ? (
                        <p className="text-[11px] text-[#94a3b8]">Current admin session is protected.</p>
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

      <div className="rounded-[14px] border border-dashed border-[#d1d5db] bg-[#f8fafc] px-5 py-4 text-[12px] leading-6 text-[#6b7280]">
        Dealer and support access still depends on the rest of the existing app flows. Changing a user to
        <span className="font-medium text-[#111827]"> dealer </span>
        does not create a dealer application, and changing a user to
        <span className="font-medium text-[#111827]"> support </span>
        does not create a separate permissions matrix.
      </div>
    </div>
  );
}
