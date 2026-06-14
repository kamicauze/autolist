"use server";

import { createClient } from "@/lib/supabase/server";
import { setAccountActivation } from "@/lib/server/account";

/**
 * Self-service: the signed-in user deactivates their own account, then is signed
 * out. Reactivation requires an admin (they can no longer sign in).
 */
export async function deactivateMyAccount(
  reason?: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const result = await setAccountActivation({
    userId: user.id,
    deactivated: true,
    actorId: user.id,
    reason: reason || "Self-service deactivation",
  });

  if ("error" in result) {
    return result;
  }

  await supabase.auth.signOut();
  return { success: true };
}
