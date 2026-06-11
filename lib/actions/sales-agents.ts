"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sendProviderEmail, sendProviderWhatsApp } from "@/lib/server/delivery-providers";
import {
  createSalesAgentInviteToken,
  getSalesAgentInviteExpiry,
  getSalesAgentInviteUrl,
  hashSalesAgentInviteToken,
  SALES_AGENT_SELECT,
} from "@/lib/server/sales-agent-invites";
import { createClient } from "@/lib/supabase/server";
import {
  sanitizeSalesAgentPermissions,
  type SalesAgentPermission,
} from "@/lib/constants/sales-agent-permissions";
import type {
  DealerSalesAgentOwner,
  SalesAgent,
  SalesAgentActionResult,
  SalesAgentListingsScope,
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
        permissions: SalesAgentPermission[];
        listings_scope: SalesAgentListingsScope;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;

  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) return null;

  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
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
      permissions: sanitizeSalesAgentPermissions(
        formData.getAll("permissions").filter((value): value is string => typeof value === "string")
      ),
      listings_scope: readString(formData, "listings_scope") === "assigned" ? "assigned" : "all",
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

function buildInviteDraft(origin: string | null) {
  const token = createSalesAgentInviteToken();
  return {
    token,
    tokenHash: hashSalesAgentInviteToken(token),
    expiresAt: getSalesAgentInviteExpiry().toISOString(),
    sentAt: new Date().toISOString(),
    inviteUrl: getSalesAgentInviteUrl(token, origin),
  };
}

async function sendSalesAgentInviteNotifications({
  agent,
  dealer,
  inviteUrl,
}: {
  agent: Pick<SalesAgentRow, "name" | "email" | "phone" | "whatsapp_enabled">;
  dealer: DealerSalesAgentOwner;
  inviteUrl: string;
}) {
  const dealerName = dealer.name || "your dealership";
  const text = [
    `Hi ${agent.name},`,
    "",
    `${dealerName} invited you to join Autolist as a sales rep.`,
    "Create an account or sign in with this email address, then accept the invite:",
    inviteUrl,
    "",
    "This link expires in 14 days.",
  ].join("\n");

  try {
    const result = await sendProviderEmail({
      to: agent.email,
      subject: `${dealerName} invited you to Autolist`,
      text,
      html: `
        <p>Hi ${escapeHtml(agent.name)},</p>
        <p>${escapeHtml(dealerName)} invited you to join Autolist as a sales rep.</p>
        <p>Create an account or sign in with this email address, then accept the invite:</p>
        <p><a href="${escapeHtml(inviteUrl)}">${escapeHtml(inviteUrl)}</a></p>
        <p>This link expires in 14 days.</p>
      `,
    });

    if (!result.success && !result.skipped) {
      console.warn(`Sales agent invite email failed: ${result.error || "Unknown provider error"}`);
    }
  } catch (error) {
    console.warn(
      `Sales agent invite email failed: ${
        error instanceof Error && error.message ? error.message : "Unknown provider error"
      }`
    );
  }

  if (!agent.whatsapp_enabled || !agent.phone) {
    return;
  }

  try {
    const result = await sendProviderWhatsApp({
      to: agent.phone,
      body: `${dealerName} invited you to join Autolist as a sales rep.\n\nAccept invite: ${inviteUrl}`,
    });

    if (!result.success && !result.skipped) {
      console.warn(`Sales agent invite WhatsApp failed: ${result.error || "Unknown provider error"}`);
    }
  } catch (error) {
    console.warn(
      `Sales agent invite WhatsApp failed: ${
        error instanceof Error && error.message ? error.message : "Unknown provider error"
      }`
    );
  }
}

export async function createSalesAgent(formData: FormData): Promise<SalesAgentActionResult> {
  const supabase = await createClient();
  const owner = await getDealerOwner(supabase);
  if ("error" in owner) return { error: owner.error };

  const parsed = validateAgentForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const invite = buildInviteDraft(await getRequestOrigin());
  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .insert({
      ...parsed.data,
      dealer_id: owner.dealer.id,
      profile_id: owner.userId,
      invite_status: "pending",
      invite_token_hash: invite.tokenHash,
      invite_expires_at: invite.expiresAt,
      invite_sent_at: invite.sentAt,
      invited_by: owner.userId,
    })
    .select(SALES_AGENT_SELECT)
    .single<SalesAgentRow>();

  if (error) {
    return {
      error: error.code === "23505" ? "A sales agent with that email already exists." : error.message,
    };
  }

  await sendSalesAgentInviteNotifications({
    agent: data,
    dealer: owner.dealer,
    inviteUrl: invite.inviteUrl,
  });

  revalidatePath("/dashboard/sales-agents");
  return { success: true, agent: mapAgent(data), inviteUrl: invite.inviteUrl };
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
    .select(SALES_AGENT_SELECT)
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
    .select(SALES_AGENT_SELECT)
    .single<SalesAgentRow>();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/sales-agents");
  return { success: true, agent: mapAgent(data) };
}

export async function assignListingToSalesRep(
  listingId: string,
  agentId: string | null
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const owner = await getDealerOwner(supabase);
  if ("error" in owner) return { error: owner.error };

  if (agentId) {
    const { data: agent, error: agentError } = await supabase
      .from("dealer_sales_agents")
      .select("id")
      .eq("id", agentId)
      .eq("dealer_id", owner.dealer.id)
      .eq("profile_id", owner.userId)
      .eq("status", "active")
      .maybeSingle<{ id: string }>();

    if (agentError) return { error: agentError.message };
    if (!agent) return { error: "That sales rep is not part of your dealership." };
  }

  const { error } = await supabase
    .from("listings")
    .update({ assigned_agent_id: agentId, updated_at: new Date().toISOString() })
    .eq("id", listingId)
    .eq("seller_id", owner.userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/sales-agents");
  return { success: true };
}

export async function resendSalesAgentInvite(agentId: string): Promise<SalesAgentActionResult> {
  const supabase = await createClient();
  const owner = await getDealerOwner(supabase);
  if ("error" in owner) return { error: owner.error };

  const invite = buildInviteDraft(await getRequestOrigin());
  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .update({
      invite_status: "pending",
      invite_token_hash: invite.tokenHash,
      invite_expires_at: invite.expiresAt,
      invite_sent_at: invite.sentAt,
      invited_by: owner.userId,
    })
    .eq("id", agentId)
    .eq("dealer_id", owner.dealer.id)
    .eq("profile_id", owner.userId)
    .neq("invite_status", "accepted")
    .select(SALES_AGENT_SELECT)
    .single<SalesAgentRow>();

  if (error) {
    return { error: error.message };
  }

  await sendSalesAgentInviteNotifications({
    agent: data,
    dealer: owner.dealer,
    inviteUrl: invite.inviteUrl,
  });

  revalidatePath("/dashboard/sales-agents");
  return { success: true, agent: mapAgent(data), inviteUrl: invite.inviteUrl };
}
