import type {
  InsuranceCoverType,
  InsuranceRequestStatus,
} from "@/lib/types/insurance";

type SupportTicketStatus =
  | "open"
  | "triaged"
  | "waiting_on_seller"
  | "waiting_on_buyer"
  | "resolved"
  | "closed";

const INSURANCE_SUPPORT_TICKET_PREFIX = "INSURANCE_META:";

export type InsuranceSupportTicketMeta = {
  reference: string;
  requesterProfileId: string | null;
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  vehicleMakeModel: string;
  vehicleYear: number;
  coverType: InsuranceCoverType;
  preferredStartDate: string;
  insurerName: string | null;
  quoteAmount: number | null;
  quoteCurrency: string;
  quotedAt: string | null;
  boundAt: string | null;
  adminNotes: string | null;
};

export function serializeInsuranceSupportTicketMeta(meta: InsuranceSupportTicketMeta) {
  return `${INSURANCE_SUPPORT_TICKET_PREFIX}${JSON.stringify(meta)}`;
}

export function parseInsuranceSupportTicketMeta(value: string | null | undefined) {
  if (!value?.startsWith(INSURANCE_SUPPORT_TICKET_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      value.slice(INSURANCE_SUPPORT_TICKET_PREFIX.length)
    ) as InsuranceSupportTicketMeta;

    if (!parsed.reference || !parsed.vehicleMakeModel || !parsed.preferredStartDate) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function insuranceStatusToSupportTicketStatus(
  status: InsuranceRequestStatus
): SupportTicketStatus {
  if (status === "quoted") return "triaged";
  if (status === "blocked") return "waiting_on_buyer";
  if (status === "bound") return "resolved";
  if (status === "cancelled") return "closed";
  return "open";
}

export function supportTicketStatusToInsuranceStatus(
  status: SupportTicketStatus
): InsuranceRequestStatus {
  if (status === "triaged") return "quoted";
  if (status === "waiting_on_buyer" || status === "waiting_on_seller") return "blocked";
  if (status === "resolved") return "bound";
  if (status === "closed") return "cancelled";
  return "new";
}

export function buildInsuranceTicketSubject(meta: InsuranceSupportTicketMeta) {
  return `Insurance quote ${meta.reference} • ${meta.vehicleYear} ${meta.vehicleMakeModel}`;
}

export function buildInsuranceCustomerSummary(meta: InsuranceSupportTicketMeta) {
  return [
    `Customer: ${meta.fullName}`,
    `Email: ${meta.email}`,
    `Phone: ${meta.phoneCountryCode} ${meta.phoneNumber}`.trim(),
    `Vehicle: ${meta.vehicleYear} ${meta.vehicleMakeModel}`,
    `Cover: ${meta.coverType}`,
    `Preferred start: ${meta.preferredStartDate}`,
  ].join("\n");
}
