"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import {
  buildInsuranceCustomerSummary,
  buildInsuranceTicketSubject,
  insuranceStatusToSupportTicketStatus,
  parseInsuranceSupportTicketMeta,
  serializeInsuranceSupportTicketMeta,
} from "@/lib/insurance/support-ticket-fallback";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";
import type {
  InsuranceRequestAdminUpdateInput,
  InsuranceRequestStatus,
  InsuranceRequestSubmissionInput,
} from "@/lib/types/insurance";

type InsuranceRequestSubmissionResult =
  | {
      success: true;
      reference: string;
    }
  | {
      error: string;
    };

type InsuranceRequestAdminUpdateResult =
  | {
      success: true;
      status: InsuranceRequestStatus;
      insurerName: string | null;
      quoteAmount: number | null;
      quoteCurrency: string;
      adminNotes: string | null;
      quotedAt: string | null;
      boundAt: string | null;
      updatedAt: string;
    }
  | {
      error: string;
    };

const INSURANCE_REQUEST_STATUSES = [
  "new",
  "quoted",
  "blocked",
  "bound",
  "cancelled",
] as const satisfies readonly InsuranceRequestStatus[];

const currentYear = new Date().getUTCFullYear() + 1;

const insuranceRequestSubmissionSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(120, "Full name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  vehicleMakeModel: z
    .string()
    .trim()
    .min(2, "Car make and model are required.")
    .max(120, "Car make and model are too long."),
  vehicleYear: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter a valid year of manufacture."),
  phoneCountryCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/, "Select a valid country code."),
  phone: z.string().trim().min(7, "Phone number is required.").max(20, "Phone number is too long."),
  coverType: z.enum(["comprehensive", "third_party_fire_theft", "third_party"]),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid cover start date."),
});

const insuranceRequestAdminUpdateSchema = z.object({
  requestId: z.string().uuid("Unknown insurance request."),
  status: z.enum(INSURANCE_REQUEST_STATUSES),
  insurerName: z.string().trim().max(120, "Insurer name is too long."),
  quoteAmount: z.string().trim(),
  adminNotes: z.string().trim().max(4000, "Internal notes are too long."),
});

type InsuranceSupportTicketRow = {
  id: string;
  status:
    | "open"
    | "triaged"
    | "waiting_on_seller"
    | "waiting_on_buyer"
    | "resolved"
    | "closed";
  internal_note: string | null;
  resolution_note: string | null;
};

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function buildInsuranceReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INS-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function parseQuoteAmount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const amount = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Quote amount must be a positive number.");
  }

  return amount;
}

function isFutureOrTodayDate(value: string) {
  const requested = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(requested.getTime())) return false;

  const today = new Date();
  const todayKey = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return requested.getTime() >= todayKey;
}

async function resolveInsuranceFallbackCreatorId(
  requesterProfileId: string | null
) {
  if (requesterProfileId) {
    return requesterProfileId;
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "support"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error || !data?.id) {
    return null;
  }

  return data.id;
}

async function submitInsuranceRequestFallback(input: {
  reference: string;
  requesterProfileId: string | null;
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  vehicleMakeModel: string;
  vehicleYear: number;
  coverType: InsuranceRequestSubmissionInput["coverType"];
  preferredStartDate: string;
}): Promise<{ success: true } | { error: string }> {
  const createdById = await resolveInsuranceFallbackCreatorId(input.requesterProfileId);
  if (!createdById) {
    return {
      error: "Insurance request storage is not ready yet. Please sign in and try again shortly.",
    };
  }

  const adminSupabase = createAdminClient();
  const meta = {
    reference: input.reference,
    requesterProfileId: input.requesterProfileId,
    fullName: input.fullName,
    email: input.email,
    phoneCountryCode: input.phoneCountryCode,
    phoneNumber: input.phoneNumber,
    vehicleMakeModel: input.vehicleMakeModel,
    vehicleYear: input.vehicleYear,
    coverType: input.coverType,
    preferredStartDate: input.preferredStartDate,
    insurerName: null,
    quoteAmount: null,
    quoteCurrency: "KES",
    quotedAt: null,
    boundAt: null,
    adminNotes: null,
  };

  const { error } = await adminSupabase.from("support_tickets").insert({
    created_by: createdById,
    category: "insurance_request",
    priority: "medium",
    status: insuranceStatusToSupportTicketStatus("new"),
    subject: buildInsuranceTicketSubject(meta),
    customer_summary: buildInsuranceCustomerSummary(meta),
    internal_note: null,
    resolution_note: serializeInsuranceSupportTicketMeta(meta),
  });

  if (error) {
    return {
      error: error.message || "Unable to submit your insurance request right now.",
    };
  }

  return { success: true as const };
}

async function updateInsuranceRequestSupportTicketState(input: {
  requestId: string;
  status: InsuranceRequestStatus;
  insurerName: string | null;
  quoteAmount: number | null;
  adminNotes: string;
  nowIso: string;
  auditUserId: string;
  auditSupabase: Awaited<ReturnType<typeof requireAdminAction>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never;
}) {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("support_tickets")
    .select("id, status, internal_note, resolution_note")
    .eq("id", input.requestId)
    .eq("category", "insurance_request")
    .maybeSingle<InsuranceSupportTicketRow>();

  if (error || !data) {
    return null;
  }

  const meta = parseInsuranceSupportTicketMeta(data.resolution_note);
  if (!meta) {
    return null;
  }

  if (input.status === "quoted" && !meta.quotedAt) {
    meta.quotedAt = input.nowIso;
  }

  if (input.status === "bound") {
    if (!meta.quotedAt) {
      meta.quotedAt = input.nowIso;
    }
    if (!meta.boundAt) {
      meta.boundAt = input.nowIso;
    }
  }

  meta.insurerName = input.insurerName;
  meta.quoteAmount = input.quoteAmount;
  meta.quoteCurrency = "KES";
  meta.adminNotes = input.adminNotes || null;

  const { error: updateError } = await adminSupabase
    .from("support_tickets")
    .update({
      status: insuranceStatusToSupportTicketStatus(input.status),
      internal_note: input.adminNotes || null,
      resolution_note: serializeInsuranceSupportTicketMeta(meta),
    })
    .eq("id", input.requestId);

  if (updateError) {
    return {
      error: updateError.message,
    };
  }

  await input.auditSupabase.from("audit_logs").insert({
    user_id: input.auditUserId,
    action: "insurance_request_updated",
    entity_type: "insurance_request",
    entity_id: input.requestId,
    details: {
      reference: meta.reference,
      previous_status: data.status,
      status: input.status,
      insurer_name: input.insurerName,
      quote_amount: input.quoteAmount,
      source: "support_ticket_fallback",
    },
  });

  return {
    success: true as const,
    status: input.status,
    insurerName: input.insurerName,
    quoteAmount: input.quoteAmount,
    quoteCurrency: "KES",
    adminNotes: input.adminNotes || null,
    quotedAt: meta.quotedAt,
    boundAt: meta.boundAt,
    updatedAt: input.nowIso,
  };
}

export async function submitInsuranceRequest(
  input: InsuranceRequestSubmissionInput
): Promise<InsuranceRequestSubmissionResult> {
  const parsed = insuranceRequestSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Complete the required insurance form fields.",
    };
  }

  const payload = parsed.data;
  const vehicleYear = Number(payload.vehicleYear);
  if (vehicleYear < 1980 || vehicleYear > currentYear) {
    return {
      error: `Year of manufacture must be between 1980 and ${currentYear}.`,
    };
  }

  if (!isFutureOrTodayDate(payload.startDate)) {
    return {
      error: "Cover start date must be today or later.",
    };
  }

  const phoneNumber = normalizePhoneNumber(payload.phone);
  if (phoneNumber.length < 7 || phoneNumber.length > 15) {
    return {
      error: "Enter a valid phone number.",
    };
  }

  const reference = buildInsuranceReference();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("insurance_requests")
    .insert({
      reference,
      requester_profile_id: user?.id ?? null,
      full_name: payload.fullName,
      email: payload.email,
      phone_country_code: payload.phoneCountryCode,
      phone_number: phoneNumber,
      vehicle_make_model: payload.vehicleMakeModel,
      vehicle_year: vehicleYear,
      cover_type: payload.coverType,
      preferred_start_date: payload.startDate,
      status: "new",
      quote_currency: "KES",
    });

  if (error && isMissingRelationError(error)) {
    const fallbackResult = await submitInsuranceRequestFallback({
      reference,
      requesterProfileId: user?.id ?? null,
      fullName: payload.fullName,
      email: payload.email,
      phoneCountryCode: payload.phoneCountryCode,
      phoneNumber,
      vehicleMakeModel: payload.vehicleMakeModel,
      vehicleYear,
      coverType: payload.coverType,
      preferredStartDate: payload.startDate,
    });

    if ("error" in fallbackResult) {
      return {
        error: fallbackResult.error,
      };
    }
  } else if (error) {
    return {
      error: error.message || "Unable to submit your insurance request right now.",
    };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/insurance-requests");

  return {
    success: true as const,
    reference,
  };
}

export async function updateInsuranceRequestAdminState(
  input: InsuranceRequestAdminUpdateInput
): Promise<InsuranceRequestAdminUpdateResult> {
  const context = await requireAdminAction();
  if ("error" in context) {
    return { error: context.error };
  }

  const parsed = insuranceRequestAdminUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Unable to update the insurance request.",
    };
  }

  const payload = parsed.data;
  const normalizedInsurerName = payload.insurerName || null;
  let quoteAmount: number | null;

  try {
    quoteAmount = parseQuoteAmount(payload.quoteAmount);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Quote amount is invalid.",
    };
  }

  if ((payload.status === "quoted" || payload.status === "bound") && !normalizedInsurerName) {
    return {
      error: "Insurer name is required before marking a request as quoted or bound.",
    };
  }

  const { supabase, user } = context;
  const { data: existingRequest, error: fetchError } = await supabase
    .from("insurance_requests")
    .select("id, reference, status, quoted_at, bound_at")
    .eq("id", payload.requestId)
    .maybeSingle<{
      id: string;
      reference: string;
      status: InsuranceRequestStatus;
      quoted_at: string | null;
      bound_at: string | null;
    }>();

  const nowIso = new Date().toISOString();

  if (fetchError && !isMissingRelationError(fetchError)) {
    return {
      error: fetchError.message,
    };
  }

  if (!existingRequest) {
    const fallbackResult = await updateInsuranceRequestSupportTicketState({
      requestId: payload.requestId,
      status: payload.status,
      insurerName: normalizedInsurerName,
      quoteAmount,
      adminNotes: payload.adminNotes,
      nowIso,
      auditUserId: user.id,
      auditSupabase: supabase,
    });

    if (fallbackResult) {
      revalidatePath("/admin", "layout");
      revalidatePath("/admin/insurance-requests");
      return fallbackResult;
    }

    return {
      error: "Insurance request not found.",
    };
  }

  const updatePayload: {
    status: InsuranceRequestStatus;
    insurer_name: string | null;
    quote_amount: number | null;
    quote_currency: string;
    admin_notes: string | null;
    quoted_at?: string | null;
    bound_at?: string | null;
  } = {
    status: payload.status,
    insurer_name: normalizedInsurerName,
    quote_amount: quoteAmount,
    quote_currency: "KES",
    admin_notes: payload.adminNotes || null,
  };

  if (payload.status === "quoted" && !existingRequest.quoted_at) {
    updatePayload.quoted_at = nowIso;
  }

  if (payload.status === "bound") {
    if (!existingRequest.quoted_at) {
      updatePayload.quoted_at = nowIso;
    }
    if (!existingRequest.bound_at) {
      updatePayload.bound_at = nowIso;
    }
  }

  const { error: updateError } = await supabase
    .from("insurance_requests")
    .update(updatePayload)
    .eq("id", payload.requestId);

  if (updateError) {
    return {
      error: updateError.message,
    };
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "insurance_request_updated",
    entity_type: "insurance_request",
    entity_id: payload.requestId,
    details: {
      reference: existingRequest.reference,
      previous_status: existingRequest.status,
      status: payload.status,
      insurer_name: normalizedInsurerName,
      quote_amount: quoteAmount,
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/insurance-requests");

  return {
    success: true as const,
    status: payload.status,
    insurerName: normalizedInsurerName,
    quoteAmount,
    quoteCurrency: "KES",
    adminNotes: payload.adminNotes || null,
    quotedAt:
      updatePayload.quoted_at === undefined ? existingRequest.quoted_at : updatePayload.quoted_at,
    boundAt:
      updatePayload.bound_at === undefined ? existingRequest.bound_at : updatePayload.bound_at,
    updatedAt: nowIso,
  };
}
