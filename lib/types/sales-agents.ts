export type SalesAgentStatus = "active" | "inactive";

export interface SalesAgent {
  id: string;
  dealer_id: string;
  profile_id: string;
  name: string;
  email: string;
  phone: string;
  status: SalesAgentStatus;
  is_verified: boolean;
  whatsapp_enabled: boolean;
  hide_phone_number: boolean;
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
  | { success: true; agent?: SalesAgent }
  | { error: string };
