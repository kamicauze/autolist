export const PLATFORM_SETTINGS_ROW_ID = 1;

export type PlatformSettings = {
  supportEmail: string;
  defaultListingReviewSlaHours: number;
  aiSmartSearchEnabled: boolean;
  manualDealerApprovalRequired: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type PlatformSettingsUpdateInput = {
  supportEmail: string;
  defaultListingReviewSlaHours: number;
  aiSmartSearchEnabled: boolean;
  manualDealerApprovalRequired: boolean;
};

export type PlatformSettingsFieldName = keyof PlatformSettingsUpdateInput;

export type PlatformSettingsFieldErrors = Partial<Record<PlatformSettingsFieldName, string>>;

export type SavePlatformSettingsResult = {
  status: "success" | "error";
  message: string;
  settings?: PlatformSettings;
  fieldErrors?: PlatformSettingsFieldErrors;
};
