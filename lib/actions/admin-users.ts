"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { setAccountActivation } from "@/lib/server/account";

/**
 * Admin: deactivate or reactivate any user account. Super-admins are protected,
 * and only a super-admin may deactivate another admin.
 */
export async function setUserAccountDeactivated(
  userId: string,
  deactivated: boolean,
  reason?: string
): Promise<{ success: true } | { error: string }> {
  const ctx = await requireAdminAction();
  if ("error" in ctx) {
    return { error: ctx.error };
  }

  if (userId === ctx.user.id) {
    return { error: "You cannot deactivate your own account here." };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Account management is not configured.",
    };
  }

  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: string }>();

  if (targetError) {
    return { error: targetError.message };
  }
  if (!target) {
    return { error: "User not found." };
  }
  if (target.role === "super_admin") {
    return { error: "Super admin accounts cannot be deactivated." };
  }
  if (target.role === "admin" && ctx.role !== "super_admin") {
    return { error: "Only a super admin can deactivate another admin." };
  }

  const result = await setAccountActivation({
    userId,
    deactivated,
    actorId: ctx.user.id,
    reason,
  });

  if ("error" in result) {
    return result;
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}
