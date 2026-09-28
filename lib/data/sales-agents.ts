import { createClient } from "@/lib/supabase/server";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import type { Listing, ListingSalesRepContact } from "@/lib/types/listing";
import type { DealerSalesAgentOwner, SalesAgent } from "@/lib/types/sales-agents";

type AgentProfileRelation = { deactivated_at: string | null };
type SalesAgentRow = Omit<SalesAgent, "listing_count" | "account_deactivated"> & {
  agent: AgentProfileRelation | AgentProfileRelation[] | null;
};

export async function getMyDealerForSalesAgents(): Promise<DealerSalesAgentOwner | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("dealers")
    .select("id, profile_id, name, status")
    .eq("profile_id", user.id)
    .in("status", ["PENDING", "APPROVED"])
    .maybeSingle<DealerSalesAgentOwner>();

  if (error) {
    console.error("Get sales agent dealer error:", error);
    return null;
  }

  return data;
}

export async function getMySalesAgents(): Promise<{
  dealer: DealerSalesAgentOwner | null;
  agents: SalesAgent[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { dealer: null, agents: [], error: "Unauthorized" };
  }

  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("id, profile_id, name, status")
    .eq("profile_id", user.id)
    .in("status", ["PENDING", "APPROVED"])
    .maybeSingle<DealerSalesAgentOwner>();

  if (dealerError) {
    console.error("Get sales agent dealer error:", dealerError);
    return { dealer: null, agents: [], error: dealerError.message };
  }

  if (!dealer) {
    return { dealer: null, agents: [] };
  }

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .select(
      "id, dealer_id, profile_id, agent_profile_id, name, email, phone, status, is_verified, whatsapp_enabled, hide_phone_number, permissions, listings_scope, invite_status, invite_expires_at, invite_sent_at, invite_accepted_at, created_at, updated_at, agent:profiles!agent_profile_id(deactivated_at)"
    )
    .eq("dealer_id", dealer.id)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .returns<SalesAgentRow[]>();

  if (error) {
    console.error("Get sales agents error:", error);
    return { dealer, agents: [], error: error.message };
  }

  return {
    dealer,
    agents: (data ?? []).map(({ agent, ...row }) => {
      const profile = Array.isArray(agent) ? agent[0] : agent;
      return {
        ...row,
        listing_count: 0,
        account_deactivated: Boolean(profile?.deactivated_at),
      };
    }),
  };
}

type PublicSalesRepRow = {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_enabled: boolean;
  hide_phone_number: boolean;
  agent:
    | { avatar_url: string | null; deactivated_at: string | null }
    | Array<{ avatar_url: string | null; deactivated_at: string | null }>
    | null;
};

/**
 * Public contact for a listing's assigned sales rep. dealer_sales_agents is
 * only readable by the dealer owner under RLS, so this uses the service role
 * with a fixed public projection and only returns active reps of the
 * listing's own dealership.
 */
export async function getListingSalesRepContact(
  listing: Pick<Listing, "assigned_agent_id" | "dealer_id">
): Promise<ListingSalesRepContact | null> {
  if (!listing.assigned_agent_id || !listing.dealer_id) return null;

  const supabase = createOptionalAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .select("id, name, phone, whatsapp_enabled, hide_phone_number, agent:profiles!agent_profile_id(avatar_url, deactivated_at)")
    .eq("id", listing.assigned_agent_id)
    .eq("dealer_id", listing.dealer_id)
    .eq("status", "active")
    .maybeSingle<PublicSalesRepRow>();

  if (error) {
    console.error("Get listing sales rep error:", error);
    return null;
  }
  if (!data) return null;

  const profile = Array.isArray(data.agent) ? data.agent[0] : data.agent;
  if (profile?.deactivated_at) return null;

  const phone = data.phone?.trim() || null;
  return {
    id: data.id,
    name: data.name,
    avatar_url: profile?.avatar_url ?? null,
    phone: data.hide_phone_number ? null : phone,
    whatsapp: data.whatsapp_enabled ? phone : null,
  };
}
