"use client";

import * as React from "react";
import {
  Clock3,
  Mail,
  Save,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { savePlatformSettingsAction } from "@/lib/actions/platform-settings";
import type {
  PlatformSettings,
  PlatformSettingsFieldErrors,
} from "@/lib/types/platform-settings";
import { cn } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSurfaceClass,
} from "./admin-ui";

type FeedbackState =
  | {
      status: "success" | "error";
      message: string;
    }
  | null;

type FormState = {
  supportEmail: string;
  defaultListingReviewSlaHours: string;
  aiSmartSearchEnabled: boolean;
  manualDealerApprovalRequired: boolean;
};

function createFormState(settings: PlatformSettings): FormState {
  return {
    supportEmail: settings.supportEmail,
    defaultListingReviewSlaHours: String(settings.defaultListingReviewSlaHours),
    aiSmartSearchEnabled: settings.aiSmartSearchEnabled,
    manualDealerApprovalRequired: settings.manualDealerApprovalRequired,
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSwitchLabel(enabled: boolean, positiveLabel: string, negativeLabel: string) {
  return enabled ? positiveLabel : negativeLabel;
}

function SettingToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
          <AdminStatusPill label={checked ? "Enabled" : "Disabled"} tone={checked ? "green" : "slate"} />
        </div>
        <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

export function AdminSettingsLive({
  initialSettings,
  schemaReady,
}: {
  initialSettings: PlatformSettings;
  schemaReady: boolean;
}) {
  const [savedSettings, setSavedSettings] = React.useState(initialSettings);
  const [form, setForm] = React.useState(() => createFormState(initialSettings));
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [fieldErrors, setFieldErrors] = React.useState<PlatformSettingsFieldErrors>({});
  const [isPending, startTransition] = React.useTransition();

  const isDirty =
    form.supportEmail !== savedSettings.supportEmail ||
    form.defaultListingReviewSlaHours !== String(savedSettings.defaultListingReviewSlaHours) ||
    form.aiSmartSearchEnabled !== savedSettings.aiSmartSearchEnabled ||
    form.manualDealerApprovalRequired !== savedSettings.manualDealerApprovalRequired;

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setFeedback(null);
    setFieldErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  };

  const resetForm = () => {
    setForm(createFormState(savedSettings));
    setFeedback(null);
    setFieldErrors({});
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      setFeedback(null);
      setFieldErrors({});

      const result = await savePlatformSettingsAction({
        supportEmail: form.supportEmail,
        defaultListingReviewSlaHours: Number(form.defaultListingReviewSlaHours),
        aiSmartSearchEnabled: form.aiSmartSearchEnabled,
        manualDealerApprovalRequired: form.manualDealerApprovalRequired,
      });

      if (result.status === "error") {
        setFeedback({
          status: "error",
          message: result.message,
        });
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (result.settings) {
        setSavedSettings(result.settings);
        setForm(createFormState(result.settings));
      }

      setFeedback({
        status: "success",
        message: result.message,
      });
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        action={
          <div
            data-tour="settings-schema-status"
            className={cn(
              "rounded-[10px] px-4 py-2 text-[12px]",
              schemaReady
                ? "border border-[#dbeafe] bg-[#eff6ff] text-[#1d4ed8]"
                : "border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]"
            )}
          >
            {schemaReady ? (
              <>
                Live values stored in <span className="font-mono">public.platform_settings</span>.
              </>
            ) : (
              <>
                Using defaults until <span className="font-mono">public.platform_settings</span> is
                available.
              </>
            )}
          </div>
        }
      />

      {!schemaReady ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">platform_settings</span> table is not available yet.
          Apply the latest Supabase migration before saving changes.
        </div>
      ) : null}

      {feedback ? (
        <div
          className={cn(
            adminSurfaceClass,
            "px-5 py-4 text-[13px]",
            feedback.status === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Support inbox"
          value={savedSettings.supportEmail}
          icon={<Mail className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Review SLA"
          value={`${savedSettings.defaultListingReviewSlaHours} hrs`}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="AI smart search"
          value={formatSwitchLabel(savedSettings.aiSmartSearchEnabled, "Enabled", "Disabled")}
          icon={<SearchCheck className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Dealer approval"
          value={formatSwitchLabel(
            savedSettings.manualDealerApprovalRequired,
            "Manual review",
            "Auto-approved"
          )}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        data-tour="settings-platform"
        title="Platform Settings"
        description="Update the marketplace defaults used by the admin team. Changes are saved immediately to Supabase when you submit."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <label
                htmlFor="supportEmail"
                className="mb-1.5 block text-[12px] font-medium text-[#374151]"
              >
                Support contact email
              </label>
              <input
                id="supportEmail"
                type="email"
                value={form.supportEmail}
                onChange={(event) => updateField("supportEmail", event.target.value)}
                className={cn(
                  adminInputClass,
                  fieldErrors.supportEmail ? "border-[#f04438] focus:border-[#f04438] focus:ring-[#f04438]/10" : null
                )}
                placeholder="support@autolist.africa"
                autoComplete="email"
              />
              {fieldErrors.supportEmail ? (
                <p className="mt-2 text-[12px] text-[#dc2626]">{fieldErrors.supportEmail}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="defaultListingReviewSlaHours"
                className="mb-1.5 block text-[12px] font-medium text-[#374151]"
              >
                Default listing review SLA (hours)
              </label>
              <input
                id="defaultListingReviewSlaHours"
                type="number"
                min={1}
                max={168}
                step={1}
                value={form.defaultListingReviewSlaHours}
                onChange={(event) =>
                  updateField("defaultListingReviewSlaHours", event.target.value)
                }
                className={cn(
                  adminInputClass,
                  fieldErrors.defaultListingReviewSlaHours
                    ? "border-[#f04438] focus:border-[#f04438] focus:ring-[#f04438]/10"
                    : null
                )}
                inputMode="numeric"
              />
              {fieldErrors.defaultListingReviewSlaHours ? (
                <p className="mt-2 text-[12px] text-[#dc2626]">
                  {fieldErrors.defaultListingReviewSlaHours}
                </p>
              ) : (
                <p className="mt-2 text-[12px] text-[#6b7280]">
                  Used as the default turnaround target for new listing reviews.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <SettingToggleRow
              title="AI smart search"
              description="Allow the marketplace to use AI-powered smart search assistance where supported."
              checked={form.aiSmartSearchEnabled}
              onCheckedChange={(checked) => updateField("aiSmartSearchEnabled", checked)}
            />

            <SettingToggleRow
              title="Manual dealer approval"
              description="Require an admin review before a dealer account is approved for marketplace activity."
              checked={form.manualDealerApprovalRequired}
              onCheckedChange={(checked) =>
                updateField("manualDealerApprovalRequired", checked)
              }
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-[#eef2f7] pt-5 md:flex-row md:items-center md:justify-between">
            <div className="text-[12px] text-[#6b7280]">
              Last saved:{" "}
              <span className="font-medium text-[#111827]">
                {formatDateTime(savedSettings.updatedAt)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending || !isDirty}
                className={cn(
                  adminGhostButtonClass,
                  (isPending || !isDirty) && "cursor-not-allowed opacity-60"
                )}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  adminPrimaryButtonClass,
                  "min-w-[152px]",
                  isPending && "cursor-not-allowed opacity-60"
                )}
              >
                <Save className="h-4 w-4" />
                {isPending ? "Saving..." : "Save settings"}
              </button>
            </div>
          </div>
        </form>
      </AdminSectionCard>
    </div>
  );
}
