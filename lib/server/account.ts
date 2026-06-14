import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

// ~100 years — Supabase has no permanent ban, so we use a very long duration.
const DEACTIVATION_BAN_DURATION = "876000h";

/**
 * Deactivate or reactivate an account. Sets the profile flag AND bans/unbans the
 * underlying Supabase auth user so the account cannot sign in or refresh tokens.
 * Always runs with the service-role client.
 */
export async function setAccountActivation(params: {
  userId: string;
  deactivated: boolean;
  actorId: string;
  reason?: string | null;
}): Promise<{ success: true } | { error: string }> {
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Account management is not configured.",
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      deactivated_at: params.deactivated ? new Date().toISOString() : null,
      deactivated_by: params.deactivated ? params.actorId : null,
      deactivation_reason: params.deactivated ? params.reason?.trim() || null : null,
    })
    .eq("id", params.userId);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: banError } = await admin.auth.admin.updateUserById(params.userId, {
    ban_duration: params.deactivated ? DEACTIVATION_BAN_DURATION : "none",
  });

  if (banError) {
    return { error: banError.message };
  }

  return { success: true };
}
