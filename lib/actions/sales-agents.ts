"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  DealerSalesAgentOwner,
  SalesAgent,
  SalesAgentActionResult,
  SalesAgentStatus,
} from "@/lib/types/sales-agents";

type SalesAgentRow = Omit<SalesAgent, "listing_count">;
type DealerOwnerResult =
  | { dealer: DealerSalesAgentOwner; userId: string }
  | { error: string };
type AgentFormResult =
  | {
      data: {
        name: string;
        email: string;
        phone: string;
        status: SalesAgentStatus;
        is_verified: boolean;
        whatsapp_enabled: boolean;
        hide_phone_number: boolean;
      };
    }
  | { error: string };

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "true" || value === "on";
}

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

function normalizeStatus(value: string): SalesAgentStatus {
  return value === "inactive" ? "inactive" : "active";
}

function validateAgentForm(formData: FormData): AgentFormResult {
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const phone = normalizePhone(readString(formData, "phone"));

  if (!name || !email || !phone) {
    return { error: "Name, email, and phone are required." as const };
  }

  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    return { error: "Enter a valid email address." as const };
  }

  return {
    data: {
      name,
      email,
      phone,
      status: normalizeStatus(readString(formData, "status")),
      is_verified: readBoolean(formData, "is_verified"),
      whatsapp_enabled: readBoolean(formData, "whatsapp_enabled"),
      hide_phone_number: readBoolean(formData, "hide_phone_number"),
    },
  };
}

async function getDealerOwner(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<DealerOwnerResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" as const };
  }

  const { data: dealer, error } = await supabase
    .from("dealers")
    .select("id, profile_id, name, status")
    .eq("profile_id", user.id)
    .in("status", ["PENDING", "APPROVED"])
    .maybeSingle<DealerSalesAgentOwner>();

  if (error) {
    return { error: error.message };
  }

  if (!dealer) {
    return { error: "Sales agents are available to pending or approved dealer owners." as const };
  }

  return { dealer, userId: user.id };
}

function mapAgent(row: SalesAgentRow): SalesAgent {
  return { ...row, listing_count: 0 };
}

export async function createSalesAgent(formData: FormData): Promise<SalesAgentActionResult> {
  const supabase = await createClient();
  const owner = await getDealerOwner(supabase);
  if ("error" in owner) return { error: owner.error };

  const parsed = validateAgentForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .insert({
      ...parsed.data,
      dealer_id: owner.dealer.id,
      profile_id: owner.userId,
    })
    .select(
      "id, dealer_id, profile_id, name, email, phone, status, is_verified, whatsapp_enabled, hide_phone_number, created_at, updated_at"
    )
    .single<SalesAgentRow>();

  if (error) {
    return {
      error: error.code === "23505" ? "A sales agent with that email already exists." : error.message,
    };
  }

  revalidatePath("/dashboard/sales-agents");
  return { success: true, agent: mapAgent(data) };
}

export async function updateSalesAgent(
  agentId: string,
  formData: FormData
): Promise<SalesAgentActionResult> {
  const supabase = await createClient();
  const owner = await getDealerOwner(supabase);
  if ("error" in owner) return { error: owner.error };

  const parsed = validateAgentForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .update(parsed.data)
    .eq("id", agentId)
    .eq("dealer_id", owner.dealer.id)
    .eq("profile_id", owner.userId)
    .select(
      "id, dealer_id, profile_id, name, email, phone, status, is_verified, whatsapp_enabled, hide_phone_number, created_at, updated_at"
    )
    .single<SalesAgentRow>();

  if (error) {
    return {
      error: error.code === "23505" ? "A sales agent with that email already exists." : error.message,
    };
  }

  revalidatePath("/dashboard/sales-agents");
  return { success: true, agent: mapAgent(data) };
}

export async function deactivateSalesAgent(agentId: string): Promise<SalesAgentActionResult> {
  const supabase = await createClient();
  const owner = await getDealerOwner(supabase);
  if ("error" in owner) return { error: owner.error };

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .update({ status: "inactive" })
    .eq("id", agentId)
    .eq("dealer_id", owner.dealer.id)
    .eq("profile_id", owner.userId)
    .select(
      "id, dealer_id, profile_id, name, email, phone, status, is_verified, whatsapp_enabled, hide_phone_number, created_at, updated_at"
    )
    .single<SalesAgentRow>();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/sales-agents");
  return { success: true, agent: mapAgent(data) };
}
