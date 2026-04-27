export type SalesAgentStatus = "active" | "inactive";

export interface SalesAgent {
  id: string;
  dealer_id: string;
  profile_id: string;
  agent_profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  status: SalesAgentStatus;
  is_verified: boolean;
  whatsapp_enabled: boolean;
  hide_phone_number: boolean;
  invite_status: "not_sent" | "pending" | "accepted" | "expired" | "revoked";
  invite_expires_at: string | null;
  invite_sent_at: string | null;
  invite_accepted_at: string | null;
  listing_count: number;
  created_at: string;
  updated_at: string;
}

export interface DealerSalesAgentOwner {
  id: string;
  profile_id: string;
  name: string;
  status: "PENDING" | "APPROVED";
}

export interface SalesAgentFormValues {
  name: string;
  email: string;
  phone: string;
  status: SalesAgentStatus;
  is_verified: boolean;
  whatsapp_enabled: boolean;
  hide_phone_number: boolean;
}

export type SalesAgentActionResult =
  | { success: true; agent?: SalesAgent; inviteUrl?: string }
  | { error: string };
