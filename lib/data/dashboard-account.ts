import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardAccountKind = "seller" | "dealer";

export type DashboardAccountContext = {
  kind: DashboardAccountKind;
  profileRole: string | null;
  dealerId: string | null;
  dealerStatus: string | null;
  dealerName: string | null;
  dealerLogoUrl: string | null;
};

type DashboardProfileRow = {
  role: string | null;
};

type DashboardDealerRow = {
  id: string;
  name: string | null;
  status: string | null;
  logo_url: string | null;
};

export async function getDashboardAccountContext(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardAccountContext> {
  const [profileResult, dealerResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle<DashboardProfileRow>(),
    supabase
      .from("dealers")
      .select("id, name, status, logo_url")
      .eq("profile_id", userId)
      .maybeSingle<DashboardDealerRow>(),
  ]);

  const profileRole = profileResult.data?.role ?? null;
  const dealer = dealerResult.data ?? null;
  const kind = profileRole === "dealer" || Boolean(dealer) ? "dealer" : "seller";

  return {
    kind,
    profileRole,
    dealerId: dealer?.id ?? null,
    dealerStatus: dealer?.status ?? null,
    dealerName: dealer?.name ?? null,
    dealerLogoUrl: dealer?.logo_url ?? null,
  };
}
