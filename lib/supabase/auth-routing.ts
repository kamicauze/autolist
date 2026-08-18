import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/constants/marketplace";

type ProfileRole =
  | "buyer"
  | "seller"
  | "dealer"
  | "sales_agent"
  | "admin"
  | "super_admin"
  | "support";
type DealerStatus = "PENDING" | "APPROVED" | "REJECTED";

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export function sanitizeNextPath(
  nextPath: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return fallback;
  return nextPath;
}

export function inferMarketplaceRoleFromNextPath(
  nextPath: string,
): UserRole | null {
  if (nextPath.startsWith("/register/dealer")) return "dealer";
  if (
    nextPath.startsWith("/dashboard/listings") ||
    nextPath.startsWith("/sell/dealer")
  ) {
    return "seller";
  }
  return null;
}

export function isPrivateSellerRole(
  role: string | null | undefined,
): role is "seller" {
  return role === "seller";
}

export function resolveSelfServiceRoleTransition(
  currentRole: string | null | undefined,
  requestedPath: string | null | undefined,
): "seller" | null {
  if (
    currentRole === "buyer" &&
    inferMarketplaceRoleFromNextPath(sanitizeNextPath(requestedPath, "")) ===
      "seller"
  ) {
    return "seller";
  }

  return null;
}

export function resolveDealerRegistrationPath(
  dealerStatus: DealerStatus | null | undefined,
): string | null {
  if (!dealerStatus) {
    return null;
  }

  return dealerStatus === "APPROVED" ? "/dashboard" : "/dashboard/verification";
}

export async function resolvePostAuthPath(
  supabase: SupabaseClient,
  userId: string,
  requestedPath?: string | null,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, deactivated_at")
    .eq("id", userId)
    .maybeSingle<{ role: ProfileRole; deactivated_at: string | null }>();

  // Deactivated accounts are blocked regardless of any requested destination.
  if (profile?.deactivated_at) {
    return "/account-deactivated";
  }

  const hasRequestedPath = Boolean(requestedPath);
  const safeRequestedPath = sanitizeNextPath(requestedPath, "");
  const requestedBasePath = safeRequestedPath.split("?")[0];
  if (
    hasRequestedPath &&
    safeRequestedPath &&
    !AUTH_PATHS.has(requestedBasePath)
  ) {
    return safeRequestedPath;
  }

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

    return (
      resolveDealerRegistrationPath(dealerProfile.status) ??
      "/dashboard/verification"
    );
  }

  if (profile.role === "admin" || profile.role === "super_admin") {
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
