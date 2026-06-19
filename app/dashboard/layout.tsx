import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/supabase/auth-routing";
import { resolvePostAuthPath } from "@/lib/supabase/auth-routing";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getDashboardAccountContext } from "@/lib/data/dashboard-account";
import { getSellerPackageAccessForUser } from "@/lib/data/membership";
import { getSalesAgentViewerContext } from "@/lib/data/sales-agent-permissions";

interface DashboardLayoutPageProps {
  children: ReactNode;
}

type DashboardProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

function getIntendedDashboardRole(userMetadata: Record<string, unknown> | undefined) {
  const intendedRole = userMetadata?.intended_role;
  return intendedRole === "seller" || intendedRole === "dealer" ? intendedRole : null;
}

export default async function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  const requestHeaders = await headers();
  const currentPath = sanitizeNextPath(
    requestHeaders.get("x-autolist-pathname"),
    "/dashboard"
  );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  const intendedDashboardRole = getIntendedDashboardRole(user.user_metadata);
  if (intendedDashboardRole) {
    const { data: profileRole } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: string | null }>();

    if (profileRole?.role === "buyer") {
      await supabase
        .from("profiles")
        .update({ role: intendedDashboardRole })
        .eq("id", user.id);
    }
  }

  const destination = await resolvePostAuthPath(supabase, user.id);
  if (destination !== "/dashboard") {
    redirect(destination);
  }

  const [profileResult, accountContext, packageAccessResult, salesAgentContext] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle<DashboardProfileRow>(),
    getDashboardAccountContext(supabase, user.id),
    getSellerPackageAccessForUser(supabase, user.id),
    getSalesAgentViewerContext(),
  ]);

  const profile = profileResult.data ?? null;
  const userMetadata = {
    ...(user.user_metadata ?? {}),
    full_name:
      (accountContext.kind === "dealer" ? accountContext.dealerName : null) ||
      profile?.full_name ||
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
    avatar_url:
      (accountContext.kind === "dealer" ? accountContext.dealerLogoUrl : null) ||
      profile?.avatar_url ||
      (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null),
  };

  return (
    <DashboardLayout
      user={{
        email: user.email,
        user_metadata: userMetadata,
      }}
      accountKind={accountContext.kind}
      packageAccess={packageAccessResult.access}
      salesAgentPermissions={salesAgentContext?.permissions ?? null}
    >
      {children}
    </DashboardLayout>
  );
}
