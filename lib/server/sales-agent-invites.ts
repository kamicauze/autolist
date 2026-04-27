import "server-only";

import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const SALES_AGENT_SELECT =
  "id, dealer_id, profile_id, agent_profile_id, name, email, phone, status, is_verified, whatsapp_enabled, hide_phone_number, invite_status, invite_expires_at, invite_sent_at, invite_accepted_at, created_at, updated_at";

const INVITE_TTL_DAYS = 14;

export type SalesAgentInviteLookup = {
  id: string;
  dealer_id: string;
  profile_id: string;
  agent_profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  invite_status: "not_sent" | "pending" | "accepted" | "expired" | "revoked";
  invite_expires_at: string | null;
  invite_accepted_at: string | null;
  dealer:
    | {
        id: string;
        name: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
      }
    | Array<{
        id: string;
        name: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
      }>
    | null;
};

export function createSalesAgentInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSalesAgentInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSalesAgentInviteExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);
  return expiresAt;
}

export function getBaseUrl(origin?: string | null) {
  const raw =
    origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export function getSalesAgentInviteUrl(token: string, origin?: string | null) {
  return `${getBaseUrl(origin)}/join/sales-agent/${encodeURIComponent(token)}`;
}

export function isSalesAgentInviteExpired(expiresAt: string | null) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());
}

export function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export async function getSalesAgentInviteByToken(token: string) {
  const tokenHash = hashSalesAgentInviteToken(token);
  let supabase: ReturnType<typeof createAdminClient>;

  try {
    supabase = createAdminClient();
  } catch (error) {
    return {
      invite: null,
      error: error instanceof Error ? error.message : "Invite lookup is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("dealer_sales_agents")
    .select(
      `
        id,
        dealer_id,
        profile_id,
        agent_profile_id,
        name,
        email,
        phone,
        status,
        invite_status,
        invite_expires_at,
        invite_accepted_at,
        dealer:dealers!dealer_id(id, name, status)
      `
    )
    .eq("invite_token_hash", tokenHash)
    .maybeSingle<SalesAgentInviteLookup>();

  if (error) {
    return { invite: null, error: error.message };
  }

  return { invite: data, error: null };
}
