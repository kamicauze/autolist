"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  AD_REPORT_REASONS,
  getAdReportPriority,
  getAdReportReasonLabel,
  type AdReportReason,
  type AdReportStatus,
  type AdReportTargetType,
} from "@/lib/types/ad-report";

type SubmitAdReportResult =
  | { success: true; reportId: string }
  | { error: string };

type UpdateAdReportResult =
  | { success: true; status: AdReportStatus; adminNote: string | null; updatedAt: string }
  | { error: string };

const adReportTargetTypes = ["listing", "dealer"] as const satisfies readonly AdReportTargetType[];
const adReportStatuses = ["open", "reviewing", "resolved", "dismissed"] as const satisfies readonly AdReportStatus[];
const adReportReasons = AD_REPORT_REASONS.map((reason) => reason.value) as [
  AdReportReason,
  ...AdReportReason[],
];

const submitAdReportSchema = z.object({
  targetType: z.enum(adReportTargetTypes),
  listingId: z.string().uuid("Unknown listing.").nullable(),
  dealerId: z.string().uuid("Unknown dealer.").nullable(),
  reason: z.enum(adReportReasons, { message: "Choose a report reason." }),
  reporterName: z.string().trim().min(2, "Name is required.").max(120, "Name is too long."),
  reporterPhone: z.string().trim().min(7, "Mobile number is required.").max(30, "Mobile number is too long."),
  reporterEmail: z.string().trim().email("Enter a valid email address."),
  location: z.string().trim().min(2, "Location is required.").max(120, "Location is too long."),
  comments: z.string().trim().min(8, "Add a short comment for the admin team.").max(2000, "Comments are too long."),
});

const updateAdReportSchema = z.object({
  reportId: z.string().uuid("Unknown report."),
  status: z.enum(adReportStatuses),
  adminNote: z.string().trim().max(2000, "Admin note is too long."),
});

export async function submitAdReport(input: unknown): Promise<SubmitAdReportResult> {
  const parsed = submitAdReportSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Check the report details and try again.",
    };
  }

  const report = parsed.data;

  if (report.targetType === "listing" && !report.listingId) {
    return { error: "Choose a listing to report." };
  }

  if (report.targetType === "dealer" && !report.dealerId) {
    return { error: "Choose a dealer to report." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("listing_reports")
      .insert({
        target_type: report.targetType,
        listing_id: report.listingId,
        dealer_id: report.dealerId,
        reporter_profile_id: user?.id ?? null,
        reporter_name: report.reporterName,
        reporter_phone: report.reporterPhone,
        reporter_email: report.reporterEmail,
        reporter_location: report.location,
        reason: report.reason,
        reason_label: getAdReportReasonLabel(report.reason),
        comments: report.comments,
        priority: getAdReportPriority(report.reason),
        status: "open",
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data?.id) {
      return {
        error: error?.message || "Unable to submit this report right now.",
      };
    }

    revalidatePath("/admin/reports");
    return { success: true, reportId: data.id };
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message.includes("service role")
          ? "Report storage is not ready yet. Please try again later."
          : "Unable to submit this report right now.",
    };
  }
}

export async function updateAdReportStatus(input: unknown): Promise<UpdateAdReportResult> {
  const admin = await requireAdminAction();

  if ("error" in admin) {
    return { error: admin.error };
  }

  const parsed = updateAdReportSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Check the report update and try again.",
    };
  }

  const { reportId, status, adminNote } = parsed.data;
  const nowIso = new Date().toISOString();
  const isFinalStatus = status === "resolved" || status === "dismissed";

  const { data, error } = await admin.supabase
    .from("listing_reports")
    .update({
      status,
      admin_note: adminNote || null,
      resolved_by: isFinalStatus ? admin.user.id : null,
      resolved_at: isFinalStatus ? nowIso : null,
    })
    .eq("id", reportId)
    .select("status, admin_note, updated_at")
    .single<{ status: AdReportStatus; admin_note: string | null; updated_at: string }>();

  if (error || !data) {
    return {
      error: error?.message || "Unable to update this report right now.",
    };
  }

  revalidatePath("/admin/reports");

  return {
    success: true,
    status: data.status,
    adminNote: data.admin_note,
    updatedAt: data.updated_at,
  };
}
