export type InsuranceCoverType =
  | "comprehensive"
  | "third_party_fire_theft"
  | "third_party";

export type InsuranceRequestStatus =
  | "new"
  | "quoted"
  | "blocked"
  | "bound"
  | "cancelled";

export type InsuranceRequestAccountRole =
  | "buyer"
  | "seller"
  | "dealer"
  | "admin"
  | "support";

export type InsuranceRequestSubmissionInput = {
  fullName: string;
  email: string;
  vehicleMakeModel: string;
  vehicleYear: string;
  phoneCountryCode: string;
  phone: string;
  coverType: InsuranceCoverType;
  startDate: string;
};

export type InsuranceRequestRecord = {
  id: string;
  reference: string;
  requester_profile_id: string | null;
  full_name: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  vehicle_make_model: string;
  vehicle_year: number;
  cover_type: InsuranceCoverType;
  preferred_start_date: string;
  status: InsuranceRequestStatus;
  insurer_name: string | null;
  quote_amount: number | null;
  quote_currency: string;
  admin_notes: string | null;
  quoted_at: string | null;
  bound_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InsuranceRequestAccountSummary = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: InsuranceRequestAccountRole | null;
};

export type InsuranceRequestAdminUpdateInput = {
  requestId: string;
  status: InsuranceRequestStatus;
  insurerName: string;
  quoteAmount: string;
  adminNotes: string;
};

