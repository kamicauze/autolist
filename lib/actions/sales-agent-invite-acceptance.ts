"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  firstRelation,
  getSalesAgentInviteByToken,
  hashSalesAgentInviteToken,
  isSalesAgentInviteExpired,
} from "@/lib/server/sales-agent-invites";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AcceptInviteResult = { success: true; dealerName: string } | { error: string };
type ProfileRole = "buyer" | "seller" | "dealer" | "sales_agent" | "support" | "admin" | "super_admin";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function acceptSalesAgentInvite(token: string): Promise<AcceptInviteResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { error: "Invite token is missing." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sign in or create an account with the invited email address first." };
  }

  const { invite, error } = await getSalesAgentInviteByToken(cleanToken);
  if (error) return { error };
  if (!invite) return { error: "This sales rep invite is invalid or has already been used." };

  if (invite.status !== "active") {
    return { error: "This sales rep record is inactive." };
  }

  if (invite.invite_status !== "pending") {
    return { error: "This invite is no longer pending." };
  }

  let adminSupabase: ReturnType<typeof createAdminClient>;
  try {
    adminSupabase = createAdminClient();
  } catch (adminClientError) {
    return {
      error:
        adminClientError instanceof Error
          ? adminClientError.message
          : "Invite acceptance is not configured.",
    };
  }

  if (isSalesAgentInviteExpired(invite.invite_expires_at)) {
    await adminSupabase
      .from("dealer_sales_agents")
      .update({
        invite_status: "expired",
        invite_token_hash: null,
      })
      .eq("id", invite.id);
    return { error: "This sales rep invite has expired. Ask the dealer to send a new one." };
  }

  const invitedEmail = invite.email.toLowerCase();
  const userEmail = (user.email || "").toLowerCase();
  if (!userEmail || userEmail !== invitedEmail) {
    return { error: `Sign in with ${invite.email} to accept this invite.` };
  }

  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, email, full_name, role, phone, whatsapp")
    .eq("id", user.id)
    .maybeSingle<{
      id: string;
      email: string | null;
      full_name: string | null;
      role: ProfileRole | null;
      phone: string | null;
      whatsapp: string | null;
    }>();

  if (profileError) {
    return { error: profileError.message };
  }

  const protectedRoles = new Set<ProfileRole>(["dealer", "support", "admin", "super_admin"]);
  if (profile?.role && protectedRoles.has(profile.role)) {
    return {
      error: "This invite must be accepted with a buyer, seller, or sales-agent account.",
    };
  }

  const profilePayload = {
    id: user.id,
    email: user.email || profile?.email || invite.email,
    full_name: profile?.full_name || invite.name,
    role: "sales_agent" as const,
    phone: profile?.phone || invite.phone,
    whatsapp: profile?.whatsapp || invite.phone,
  };

  const { error: upsertError } = await adminSupabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (upsertError) {
    return { error: upsertError.message };
  }

  const { data: acceptedAgent, error: acceptError } = await adminSupabase
    .from("dealer_sales_agents")
    .update({
      agent_profile_id: user.id,
      invite_status: "accepted",
      invite_accepted_at: new Date().toISOString(),
      invite_token_hash: null,
    })
    .eq("id", invite.id)
    .eq("invite_status", "pending")
    .eq("invite_token_hash", hashSalesAgentInviteToken(cleanToken))
    .select("id")
    .maybeSingle<{ id: string }>();

  if (acceptError) {
    return { error: acceptError.message };
  }

  if (!acceptedAgent) {
    return { error: "This invite was already accepted or replaced. Ask the dealer for a new link." };
  }

  const dealer = firstRelation(invite.dealer);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sales-agents");
  return { success: true, dealerName: dealer?.name || "the dealership" };
}

function redirectToInvite(token: string, status: "success" | "error", message: string): never {
  const params = new URLSearchParams({ status, message });
  redirect(`/join/sales-agent/${encodeURIComponent(token)}?${params.toString()}`);
}

export async function acceptSalesAgentInviteAction(formData: FormData): Promise<void> {
  const token = readString(formData, "token");
  const result = await acceptSalesAgentInvite(token);

  if ("error" in result) {
    redirectToInvite(token, "error", result.error);
  }

  const params = new URLSearchParams({
    status: "success",
    message: `You are now connected to ${result.dealerName}.`,
  });
  redirect(`/dashboard?${params.toString()}`);
}
