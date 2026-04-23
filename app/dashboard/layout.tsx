import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthPath } from "@/lib/supabase/auth-routing";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getSellerPackageAccessForUser } from "@/lib/data/membership";

interface DashboardLayoutPageProps {
  children: ReactNode;
}

type DashboardProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

export default async function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const destination = await resolvePostAuthPath(supabase, user.id);
  if (destination !== "/dashboard") {
    redirect(destination);
  }

  const [profileResult, packageAccessResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle<DashboardProfileRow>(),
    getSellerPackageAccessForUser(supabase, user.id),
  ]);

  const profile = profileResult.data ?? null;
  const userMetadata = {
    ...(user.user_metadata ?? {}),
    full_name:
      profile?.full_name ||
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
    avatar_url:
      profile?.avatar_url ||
      (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null),
  };

  return (
    <DashboardLayout
      user={{
        email: user.email,
        user_metadata: userMetadata,
      }}
      packageAccess={packageAccessResult.access}
    >
      {children}
    </DashboardLayout>
  );
}
