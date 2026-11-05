import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canRenderBuyerAccountPage,
  resolvePostAuthPath,
  resolveSelfServiceRoleTransition,
  sanitizeNextPath,
} from "@/lib/supabase/auth-routing";
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

  const { data: profileRole } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  const destination = await resolvePostAuthPath(supabase, user.id);
  if (destination === "/" && resolveSelfServiceRoleTransition(profileRole?.role, currentPath)) {
    redirect(
      `/register/onboarding?role=seller&next=${encodeURIComponent(currentPath)}`,
    );
  }

  if (canRenderBuyerAccountPage(profileRole?.role, destination, currentPath)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <nav aria-label="Buyer account" className="mb-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-primary">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/profile", label: "Account details" },
              { href: "/dashboard/favorites", label: "Favourites" },
              { href: "/alerts", label: "Listing alerts" },
              { href: "/notifications", label: "Notifications" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} aria-current={currentPath.split("?")[0] === href ? "page" : undefined} className="hover:underline aria-[current=page]:underline">
                {label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  const canRenderDealerVerification =
    profileRole?.role === "dealer" &&
    destination === "/dashboard/verification" &&
    currentPath.split("?")[0] === destination;
  if (destination !== "/dashboard" && !canRenderDealerVerification) {
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
