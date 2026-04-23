import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  PLATFORM_SETTINGS_ROW_ID,
  type PlatformSettings,
} from "@/lib/types/platform-settings";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type PlatformSettingsRow = {
  id: number;
  support_email: string;
  default_listing_review_sla_hours: number;
  ai_smart_search_enabled: boolean;
  manual_dealer_approval_required: boolean;
  updated_at: string;
  updated_by: string | null;
};

const PLATFORM_SETTINGS_SELECT = `
  id,
  support_email,
  default_listing_review_sla_hours,
  ai_smart_search_enabled,
  manual_dealer_approval_required,
  updated_at,
  updated_by
`;

export function getDefaultPlatformSettings(): PlatformSettings {
  return {
    supportEmail: "support@autolist.africa",
    defaultListingReviewSlaHours: 24,
    aiSmartSearchEnabled: true,
    manualDealerApprovalRequired: true,
    updatedAt: null,
    updatedBy: null,
  };
}

export function mapPlatformSettingsRow(
  row: PlatformSettingsRow | null | undefined
): PlatformSettings {
  if (!row) {
    return getDefaultPlatformSettings();
  }

  return {
    supportEmail: row.support_email,
    defaultListingReviewSlaHours: row.default_listing_review_sla_hours,
    aiSmartSearchEnabled: row.ai_smart_search_enabled,
    manualDealerApprovalRequired: row.manual_dealer_approval_required,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getPlatformSettingsData(
  supabase?: ServerSupabaseClient
): Promise<{
  settings: PlatformSettings;
  schemaReady: boolean;
}> {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("platform_settings")
    .select(PLATFORM_SETTINGS_SELECT)
    .eq("id", PLATFORM_SETTINGS_ROW_ID)
    .maybeSingle<PlatformSettingsRow>();

  if (error) {
    if (isMissingRelationError(error)) {
      return {
        settings: getDefaultPlatformSettings(),
        schemaReady: false,
      };
    }

    throw new Error(`Unable to load platform settings: ${error.message}`);
  }

  return {
    settings: mapPlatformSettingsRow(data),
    schemaReady: true,
  };
}

export async function getPlatformSettings(
  supabase?: ServerSupabaseClient
): Promise<PlatformSettings> {
  const { settings } = await getPlatformSettingsData(supabase);
  return settings;
}
