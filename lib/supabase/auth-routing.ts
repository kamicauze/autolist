import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileRole = "buyer" | "seller" | "dealer" | "admin" | "support";
type DealerStatus = "PENDING" | "APPROVED" | "REJECTED";

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export function sanitizeNextPath(
  nextPath: string | null | undefined,
  fallback = "/dashboard"
) {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return fallback;
  return nextPath;
}

export async function resolvePostAuthPath(
  supabase: SupabaseClient,
  userId: string,
  requestedPath?: string | null
) {
  const hasRequestedPath = Boolean(requestedPath);
  const safeRequestedPath = sanitizeNextPath(requestedPath, "");
  const requestedBasePath = safeRequestedPath.split("?")[0];
  if (hasRequestedPath && safeRequestedPath && !AUTH_PATHS.has(requestedBasePath)) {
    return safeRequestedPath;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: ProfileRole }>();

  if (!profile) {
    return "/register/onboarding";
  }

  if (profile.role === "dealer") {
    const { data: dealerProfile } = await supabase
      .from("dealers")
      .select("status")
      .eq("profile_id", userId)
      .maybeSingle<{ status: DealerStatus }>();

    if (!dealerProfile) {
      return "/register/dealer";
    }

    return dealerProfile.status === "APPROVED" ? "/dashboard" : "/dashboard/verification";
  }

  if (profile.role === "admin") {
    return "/admin/dashboard";
  }

  if (profile.role === "support") {
    return "/support/tickets";
  }

  if (profile.role === "buyer") {
    return "/";
  }

  return "/dashboard";
}
