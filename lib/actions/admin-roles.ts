"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdminAction } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ADMIN_ROLES = [
  "buyer",
  "seller",
  "dealer",
  "sales_agent",
  "support",
  "admin",
  "super_admin",
] as const;

type AllowedAdminRole = (typeof ALLOWED_ADMIN_ROLES)[number];

export type AdminRoleMutationResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

function formatRole(role: string) {
  return role.replace(/\b\w/g, (char) => char.toUpperCase());
}

function successResult(message: string): AdminRoleMutationResult {
  return {
    success: true,
    message,
  };
}

function errorResult(error: string): AdminRoleMutationResult {
  return {
    success: false,
    error,
  };
}

export async function updateAdminUserRoleAction(formData: FormData): Promise<AdminRoleMutationResult> {
  const targetUserId = String(formData.get("userId") || "").trim();
  const nextRole = String(formData.get("nextRole") || "").trim() as AllowedAdminRole;

  const adminContext = await requireSuperAdminAction();
  if ("error" in adminContext) {
    return errorResult(adminContext.error);
  }

  if (!targetUserId) {
    return errorResult("Missing target user.");
  }

  if (!ALLOWED_ADMIN_ROLES.includes(nextRole)) {
    return errorResult("Select a valid role.");
  }

  if (targetUserId === adminContext.user.id) {
    return errorResult("Use a different admin account to change your own role.");
  }

  try {
    const adminSupabase = createAdminClient();

    const { data: targetProfile, error: targetProfileError } = await adminSupabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetProfileError || !targetProfile) {
      return errorResult("Target user was not found.");
    }

    const currentRole = targetProfile.role as AllowedAdminRole;
    const targetName = targetProfile.full_name || targetProfile.email || "This user";

    if (currentRole === nextRole) {
      return successResult(`${targetName} is already ${formatRole(nextRole)}.`);
    }

    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", targetUserId);

    if (updateError) {
      return errorResult(updateError.message);
    }

    const { error: auditError } = await adminSupabase.from("audit_logs").insert({
      user_id: adminContext.user.id,
      action: "role_updated",
      entity_type: "profile",
      entity_id: targetUserId,
      details: {
        previous_role: currentRole,
        next_role: nextRole,
        target_name: targetProfile.full_name,
        target_email: targetProfile.email,
      },
    });

    if (auditError) {
      console.warn(`Failed to write role update audit log: ${auditError.message}`);
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/users");
    revalidatePath("/admin/roles-permissions");
    revalidatePath("/admin/audit-logs");

    return successResult(
      `Updated ${targetName} from ${formatRole(currentRole)} to ${formatRole(nextRole)}.`
    );
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unknown error";
    return errorResult(message);
  }
}

export async function updateRolePermissionAction(formData: FormData): Promise<AdminRoleMutationResult> {
  const role = String(formData.get("role") || "").trim() as AllowedAdminRole;
  const permissionKey = String(formData.get("permissionKey") || "").trim();
  const enabled = String(formData.get("enabled") || "") === "true";

  const adminContext = await requireSuperAdminAction();
  if ("error" in adminContext) {
    return errorResult(adminContext.error);
  }

  if (!ALLOWED_ADMIN_ROLES.includes(role)) {
    return errorResult("Select a valid role.");
  }

  if (!permissionKey) {
    return errorResult("Missing permission.");
  }

  try {
    const adminSupabase = createAdminClient();
    const { data: permission, error: permissionError } = await adminSupabase
      .from("permissions")
      .select("key")
      .eq("key", permissionKey)
      .maybeSingle<{ key: string }>();

    if (permissionError || !permission) {
      return errorResult("Permission was not found.");
    }

    if (enabled) {
      const { error } = await adminSupabase
        .from("role_permissions")
        .upsert(
          {
            role,
            permission_key: permissionKey,
          },
          { onConflict: "role,permission_key" }
        );

      if (error) {
        return errorResult(error.message);
      }
    } else {
      if (role === "super_admin") {
        return errorResult("Super admin permissions cannot be removed.");
      }

      const { error } = await adminSupabase
        .from("role_permissions")
        .delete()
        .eq("role", role)
        .eq("permission_key", permissionKey);

      if (error) {
        return errorResult(error.message);
      }
    }

    await adminSupabase.from("audit_logs").insert({
      user_id: adminContext.user.id,
      action: enabled ? "role_permission_enabled" : "role_permission_disabled",
      entity_type: "role_permission",
      entity_id: null,
      details: {
        role,
        permission_key: permissionKey,
      },
    });

    revalidatePath("/admin/roles-permissions");
    return successResult(
      `${enabled ? "Enabled" : "Disabled"} ${permissionKey} for ${formatRole(role)}.`
    );
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unknown error";
    return errorResult(message);
  }
}
