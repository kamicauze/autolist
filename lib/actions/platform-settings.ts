"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { mapPlatformSettingsRow } from "@/lib/data/platform-settings";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  PLATFORM_SETTINGS_ROW_ID,
  type PlatformSettingsFieldErrors,
  type PlatformSettingsUpdateInput,
  type SavePlatformSettingsResult,
} from "@/lib/types/platform-settings";

const platformSettingsUpdateSchema = z.object({
  supportEmail: z
    .string()
    .trim()
    .min(1, "Support email is required.")
    .email("Enter a valid support email address.")
    .max(320, "Support email is too long."),
  defaultListingReviewSlaHours: z
    .number()
    .int("SLA must be a whole number of hours.")
    .min(1, "SLA must be at least 1 hour.")
    .max(168, "SLA must be 168 hours or less."),
  aiSmartSearchEnabled: z.boolean(),
  manualDealerApprovalRequired: z.boolean(),
});

type PlatformSettingsRow = {
  id: number;
  support_email: string;
  default_listing_review_sla_hours: number;
  ai_smart_search_enabled: boolean;
  manual_dealer_approval_required: boolean;
  updated_at: string;
  updated_by: string | null;
};

function getFieldErrors(error: z.ZodError<PlatformSettingsUpdateInput>): PlatformSettingsFieldErrors {
  const fieldErrors: PlatformSettingsFieldErrors = {};
  const flattened = error.flatten().fieldErrors;

  if (flattened.supportEmail?.[0]) {
    fieldErrors.supportEmail = flattened.supportEmail[0];
  }

  if (flattened.defaultListingReviewSlaHours?.[0]) {
    fieldErrors.defaultListingReviewSlaHours = flattened.defaultListingReviewSlaHours[0];
  }

  if (flattened.aiSmartSearchEnabled?.[0]) {
    fieldErrors.aiSmartSearchEnabled = flattened.aiSmartSearchEnabled[0];
  }

  if (flattened.manualDealerApprovalRequired?.[0]) {
    fieldErrors.manualDealerApprovalRequired = flattened.manualDealerApprovalRequired[0];
  }

  return fieldErrors;
}

export async function savePlatformSettingsAction(
  input: PlatformSettingsUpdateInput
): Promise<SavePlatformSettingsResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return {
      status: "error",
      message: adminContext.error,
    };
  }

  const parsed = platformSettingsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Fix the highlighted settings and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const payload = {
    id: PLATFORM_SETTINGS_ROW_ID,
    support_email: parsed.data.supportEmail,
    default_listing_review_sla_hours: parsed.data.defaultListingReviewSlaHours,
    ai_smart_search_enabled: parsed.data.aiSmartSearchEnabled,
    manual_dealer_approval_required: parsed.data.manualDealerApprovalRequired,
    updated_by: adminContext.user.id,
  };

  const { data, error } = await adminContext.supabase
    .from("platform_settings")
    .upsert(payload, { onConflict: "id" })
    .select(
      `
        id,
        support_email,
        default_listing_review_sla_hours,
        ai_smart_search_enabled,
        manual_dealer_approval_required,
        updated_at,
        updated_by
      `
    )
    .single<PlatformSettingsRow>();

  if (error) {
    if (isMissingRelationError(error)) {
      return {
        status: "error",
        message: "Platform settings storage is not ready yet. Apply the latest Supabase migration first.",
      };
    }

    return {
      status: "error",
      message: error.message || "Unable to save platform settings right now.",
    };
  }

  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Platform settings saved.",
    settings: mapPlatformSettingsRow(data),
  };
}
