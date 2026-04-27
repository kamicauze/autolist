import { cache } from "react";
import {
  parseInsuranceSupportTicketMeta,
  supportTicketStatusToInsuranceStatus,
} from "@/lib/insurance/support-ticket-fallback";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";
import type {
  InsuranceCoverType,
  InsuranceRequestAccountRole,
  InsuranceRequestStatus,
} from "@/lib/types/insurance";

type InsuranceRequestAccountRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: InsuranceRequestAccountRole | null;
};

type InsuranceRequestRow = {
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
  quote_currency: string | null;
  admin_notes: string | null;
  quoted_at: string | null;
  bound_at: string | null;
  created_at: string;
  updated_at: string;
  requester_profile: InsuranceRequestAccountRow[] | InsuranceRequestAccountRow | null;
};

type InsuranceSupportTicketRow = {
  id: string;
  created_by: string;
  status:
    | "open"
    | "triaged"
    | "waiting_on_seller"
    | "waiting_on_buyer"
    | "resolved"
    | "closed";
  internal_note: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  requester_profile: InsuranceRequestAccountRow[] | InsuranceRequestAccountRow | null;
};

export type AdminInsuranceRequestItem = {
  id: string;
  reference: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterProfileId: string | null;
  requesterAccountName: string | null;
  requesterAccountEmail: string | null;
  requesterAccountRole: InsuranceRequestAccountRole | null;
  vehicleMakeModel: string;
  vehicleYear: number;
  vehicleLabel: string;
  coverType: InsuranceCoverType;
  preferredStartDate: string;
  status: InsuranceRequestStatus;
  insurerName: string | null;
  quoteAmount: number | null;
  quoteCurrency: string;
  adminNotes: string | null;
  quotedAt: string | null;
  boundAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminInsuranceRequestsData = {
  stats: {
    openRequests: number;
    quotedToday: number;
    blockedCases: number;
    policiesBound: number;
  };
  requests: AdminInsuranceRequestItem[];
};

const EMPTY_ADMIN_INSURANCE_REQUESTS_DATA: AdminInsuranceRequestsData = {
  stats: {
    openRequests: 0,
    quotedToday: 0,
    blockedCases: 0,
    policiesBound: 0,
  },
  requests: [],
};

function describeError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

async function createAdminDataClient() {
  return createOptionalAdminClient() ?? (await createClient());
}

function formatPhone(countryCode: string, phoneNumber: string) {
  return `${countryCode} ${phoneNumber}`.trim();
}

function normalizeInsuranceRequest(row: InsuranceRequestRow): AdminInsuranceRequestItem {
  const requesterProfile = Array.isArray(row.requester_profile)
    ? row.requester_profile[0] ?? null
    : row.requester_profile;

  return {
    id: row.id,
    reference: row.reference,
    requesterName: row.full_name,
    requesterEmail: row.email,
    requesterPhone: formatPhone(row.phone_country_code, row.phone_number),
    requesterProfileId: row.requester_profile_id,
    requesterAccountName: requesterProfile?.full_name ?? null,
    requesterAccountEmail: requesterProfile?.email ?? null,
    requesterAccountRole: requesterProfile?.role ?? null,
    vehicleMakeModel: row.vehicle_make_model,
    vehicleYear: row.vehicle_year,
    vehicleLabel: `${row.vehicle_year} ${row.vehicle_make_model}`,
    coverType: row.cover_type,
    preferredStartDate: row.preferred_start_date,
    status: row.status,
    insurerName: row.insurer_name,
    quoteAmount: row.quote_amount,
    quoteCurrency: row.quote_currency || "KES",
    adminNotes: row.admin_notes,
    quotedAt: row.quoted_at,
    boundAt: row.bound_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeInsuranceSupportTicket(row: InsuranceSupportTicketRow) {
  const meta = parseInsuranceSupportTicketMeta(row.resolution_note);
  if (!meta) {
    return null;
  }

  const requesterProfile = Array.isArray(row.requester_profile)
    ? row.requester_profile[0] ?? null
    : row.requester_profile;
  const hasRequesterAccount =
    Boolean(meta.requesterProfileId) && requesterProfile?.id === meta.requesterProfileId;

  return {
    id: row.id,
    reference: meta.reference,
    requesterName: meta.fullName,
    requesterEmail: meta.email,
    requesterPhone: formatPhone(meta.phoneCountryCode, meta.phoneNumber),
    requesterProfileId: meta.requesterProfileId,
    requesterAccountName: hasRequesterAccount ? requesterProfile?.full_name ?? null : null,
    requesterAccountEmail: hasRequesterAccount ? requesterProfile?.email ?? null : null,
    requesterAccountRole: hasRequesterAccount ? requesterProfile?.role ?? null : null,
    vehicleMakeModel: meta.vehicleMakeModel,
    vehicleYear: meta.vehicleYear,
    vehicleLabel: `${meta.vehicleYear} ${meta.vehicleMakeModel}`,
    coverType: meta.coverType,
    preferredStartDate: meta.preferredStartDate,
    status: supportTicketStatusToInsuranceStatus(row.status),
    insurerName: meta.insurerName,
    quoteAmount: meta.quoteAmount,
    quoteCurrency: meta.quoteCurrency || "KES",
    adminNotes: meta.adminNotes ?? row.internal_note,
    quotedAt: meta.quotedAt,
    boundAt: meta.boundAt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies AdminInsuranceRequestItem;
}

function isOpenInsuranceRequest(status: InsuranceRequestStatus) {
  return status === "new" || status === "quoted" || status === "blocked";
}

function mergeInsuranceRequests(
  primary: AdminInsuranceRequestItem[],
  fallback: AdminInsuranceRequestItem[]
) {
  const byReference = new Map<string, AdminInsuranceRequestItem>();

  for (const request of primary) {
    byReference.set(request.reference, request);
  }

  for (const request of fallback) {
    if (!byReference.has(request.reference)) {
      byReference.set(request.reference, request);
    }
  }

  return Array.from(byReference.values()).sort(
    (left, right) => right.createdAt.localeCompare(left.createdAt)
  );
}

export function calculateInsuranceRequestStats(
  requests: Pick<AdminInsuranceRequestItem, "status" | "quotedAt">[]
) {
  const todayKey = new Date().toISOString().slice(0, 10);

  return {
    openRequests: requests.filter((request) => isOpenInsuranceRequest(request.status)).length,
    quotedToday: requests.filter((request) => request.quotedAt?.slice(0, 10) === todayKey).length,
    blockedCases: requests.filter((request) => request.status === "blocked").length,
    policiesBound: requests.filter((request) => request.status === "bound").length,
  };
}

async function getFallbackInsuranceRequestsData(limit: number) {
  const supabase = await createAdminDataClient();

  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        created_by,
        status,
        internal_note,
        resolution_note,
        created_at,
        updated_at,
        requester_profile:profiles!created_by(id, full_name, email, role)
      `
    )
    .eq("category", "insurance_request")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as unknown as InsuranceSupportTicketRow[])
    .map(normalizeInsuranceSupportTicket)
    .filter((request): request is AdminInsuranceRequestItem => Boolean(request));
}

export const getAdminInsuranceRequestsData = cache(
  async (limit = 80): Promise<AdminInsuranceRequestsData> => {
    try {
      const supabase = await createAdminDataClient();

      const { data, error } = await supabase
        .from("insurance_requests")
        .select(
          `
            id,
            reference,
            requester_profile_id,
            full_name,
            email,
            phone_country_code,
            phone_number,
            vehicle_make_model,
            vehicle_year,
            cover_type,
            preferred_start_date,
            status,
            insurer_name,
            quote_amount,
            quote_currency,
            admin_notes,
            quoted_at,
            bound_at,
            created_at,
            updated_at,
            requester_profile:profiles!requester_profile_id(id, full_name, email, role)
          `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      const fallbackRequests = await getFallbackInsuranceRequestsData(limit);

      if (error && !isMissingRelationError(error)) {
        throw new Error(error.message);
      }

      const primaryRequests = error
        ? []
        : ((data || []) as unknown as InsuranceRequestRow[]).map(normalizeInsuranceRequest);
      const requests = mergeInsuranceRequests(primaryRequests, fallbackRequests);

      return {
        stats: calculateInsuranceRequestStats(requests),
        requests,
      };
    } catch (error) {
      console.warn(`Admin insurance requests unavailable: ${describeError(error)}`);
      return EMPTY_ADMIN_INSURANCE_REQUESTS_DATA;
    }
  }
);
