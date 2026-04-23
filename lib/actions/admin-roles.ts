"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ADMIN_ROLES = ["buyer", "seller", "dealer", "admin", "support"] as const;

type AllowedAdminRole = (typeof ALLOWED_ADMIN_ROLES)[number];

function formatRole(role: string) {
  return role.replace(/\b\w/g, (char) => char.toUpperCase());
}

function redirectWithFeedback(status: "success" | "error", message: string): never {
  const params = new URLSearchParams({
    status,
    message,
  });

  redirect(`/admin/roles-permissions?${params.toString()}`);
}

export async function updateAdminUserRoleAction(formData: FormData) {
  const targetUserId = String(formData.get("userId") || "").trim();
  const nextRole = String(formData.get("nextRole") || "").trim() as AllowedAdminRole;

  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    redirectWithFeedback("error", adminContext.error);
  }

  if (!targetUserId) {
    redirectWithFeedback("error", "Missing target user.");
  }

  if (!ALLOWED_ADMIN_ROLES.includes(nextRole)) {
    redirectWithFeedback("error", "Select a valid role.");
  }

  if (targetUserId === adminContext.user.id) {
    redirectWithFeedback("error", "Use a different admin account to change your own role.");
  }

  try {
    const adminSupabase = createAdminClient();

    const { data: targetProfile, error: targetProfileError } = await adminSupabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetProfileError || !targetProfile) {
      redirectWithFeedback("error", "Target user was not found.");
    }

    const currentRole = targetProfile.role as AllowedAdminRole;
    const targetName = targetProfile.full_name || targetProfile.email || "This user";

    if (currentRole === nextRole) {
      redirectWithFeedback("success", `${targetName} is already ${formatRole(nextRole)}.`);
    }

    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", targetUserId);

    if (updateError) {
      redirectWithFeedback("error", updateError.message);
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

    redirectWithFeedback(
      "success",
      `Updated ${targetName} from ${formatRole(currentRole)} to ${formatRole(nextRole)}.`
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message = error instanceof Error && error.message ? error.message : "Unknown error";
    redirectWithFeedback("error", message);
  }
}
