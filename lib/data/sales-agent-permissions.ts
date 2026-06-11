import { createClient } from "@/lib/supabase/server";
import {
  sanitizeSalesAgentPermissions,
  type SalesAgentPermission,
} from "@/lib/constants/sales-agent-permissions";
import type { SalesAgentListingsScope } from "@/lib/types/sales-agents";

export interface SalesAgentViewerContext {
  /** dealer_sales_agents row id */
  id: string;
  dealerId: string;
  /** dealer owner profile id — the principal the rep acts on behalf of */
  principalProfileId: string;
  dealerName: string;
  permissions: SalesAgentPermission[];
  listingsScope: SalesAgentListingsScope;
}

/**
 * Resolves the dealership context for the currently signed-in user when they are
 * an active, accepted sales rep. Returns null for dealers, buyers, sellers, and
 * unauthenticated visitors. Use this to gate rep-facing dashboard sections and to
 * scope data queries to the dealer owner the rep represents.
 */
export async function getSalesAgentViewerContext(): Promise<SalesAgentViewerContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .select("id, dealer_id, permissions, listings_scope, profile_id, dealer:dealers!dealer_id(name)")
    .eq("agent_profile_id", user.id)
    .eq("status", "active")
    .eq("invite_status", "accepted")
    .order("created_at", { ascending: true })
    .maybeSingle<{
      id: string;
      dealer_id: string;
      permissions: string[] | null;
      listings_scope: SalesAgentListingsScope | null;
      profile_id: string;
      dealer: { name: string } | { name: string }[] | null;
    }>();

  if (error || !data) {
    return null;
  }

  const dealer = Array.isArray(data.dealer) ? data.dealer[0] : data.dealer;

  return {
    id: data.id,
    dealerId: data.dealer_id,
    principalProfileId: data.profile_id,
    dealerName: dealer?.name ?? "your dealership",
    permissions: sanitizeSalesAgentPermissions(data.permissions ?? []),
    listingsScope: data.listings_scope === "assigned" ? "assigned" : "all",
  };
}
