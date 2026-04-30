/* eslint-disable @next/next/no-img-element */

"use client";

import * as React from "react";
import {
  Bell,
  Eye,
  FileBadge2,
  ImageIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  createCmsBannerDraft,
  deleteCmsBanner,
  saveCmsBanner,
} from "@/lib/actions/cms-banners";
import { AdminCmsMediaField } from "@/components/admin/admin-cms-media-library";
import {
  CMS_BANNER_PLACEMENT_LABELS,
  CMS_BANNER_PLACEMENTS,
  CMS_BANNER_STATUSES,
  type AdminCmsBannersData,
  type CmsBanner,
  type CmsBannerPlacement,
  type CmsBannerStatus,
} from "@/lib/types/cms-banners";
import type { AdminCmsMediaData, CmsMediaAsset } from "@/lib/types/cms-media";
import { cn } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminSurfaceClass,
  adminTextareaClass,
} from "./admin-ui";

type FeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

type PendingAction = "create" | "save" | "delete" | null;

type BannerEditorState = {
  title: string;
  placement: CmsBannerPlacement;
  status: CmsBannerStatus;
  desktopImageUrl: string;
  mobileImageUrl: string;
  altText: string;
  targetUrl: string;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
};

function toDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function createEditorState(banner: CmsBanner | null): BannerEditorState {
  return {
    title: banner?.title ?? "",
    placement: banner?.placement ?? "home_top",
    status: banner?.status ?? "draft",
    desktopImageUrl: banner?.desktopImageUrl ?? "",
    mobileImageUrl: banner?.mobileImageUrl ?? "",
    altText: banner?.altText ?? "",
    targetUrl: banner?.targetUrl ?? "",
    startsAt: toDateTimeLocal(banner?.startsAt ?? null),
    endsAt: toDateTimeLocal(banner?.endsAt ?? null),
    sortOrder: banner?.sortOrder ?? 0,
  };
}

function sortBanners(banners: CmsBanner[]) {
  return [...banners].sort((left, right) => {
    if (left.placement !== right.placement) {
      return left.placement.localeCompare(right.placement);
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function statusTone(status: CmsBannerStatus, isCurrentlyLive: boolean) {
  if (isCurrentlyLive) return "green" as const;
  if (status === "active") return "blue" as const;
  if (status === "paused") return "amber" as const;
  return "slate" as const;
}

function getStatusLabel(banner: CmsBanner) {
  if (banner.isCurrentlyLive) return "Live";
  if (banner.status === "active" && banner.startsAt && new Date(banner.startsAt).getTime() > Date.now()) {
    return "Scheduled";
  }
  return banner.status.charAt(0).toUpperCase() + banner.status.slice(1);
}

function formatDate(value: string | null) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRunPeriod(banner: CmsBanner) {
  if (!banner.startsAt && !banner.endsAt) return "Always on";
  return `${formatDate(banner.startsAt)} - ${formatDate(banner.endsAt)}`;
}

function calculateStats(banners: CmsBanner[]) {
  const impressions = banners.reduce((sum, banner) => sum + banner.impressionCount, 0);
  const clicks = banners.reduce((sum, banner) => sum + banner.clickCount, 0);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return {
    total: banners.length,
    live: banners.filter((banner) => banner.isCurrentlyLive).length,
    scheduled: banners.filter(
      (banner) =>
        banner.status === "active" &&
        Boolean(banner.startsAt) &&
        new Date(banner.startsAt!).getTime() > now
    ).length,
    expiringSoon: banners.filter(
      (banner) =>
        banner.status === "active" &&
        Boolean(banner.endsAt) &&
        new Date(banner.endsAt!).getTime() >= now &&
        new Date(banner.endsAt!).getTime() <= now + sevenDays
    ).length,
    averageCtr: impressions > 0 ? (clicks / impressions) * 100 : 0,
  };
}

function formatCtr(banner: CmsBanner) {
  if (banner.impressionCount <= 0) return "No impressions";
  return `${((banner.clickCount / banner.impressionCount) * 100).toFixed(2)}% CTR`;
}

export function AdminAdsBannersLive({
  data,
  mediaData,
}: {
  data: AdminCmsBannersData;
  mediaData: AdminCmsMediaData;
}) {
  const [banners, setBanners] = React.useState(() => sortBanners(data.banners));
  const [mediaAssets, setMediaAssets] = React.useState(mediaData.assets);
  const [selectedId, setSelectedId] = React.useState(data.banners[0]?.id ?? "");
  const [editor, setEditor] = React.useState(() => createEditorState(data.banners[0] ?? null));
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);
  const [isPending, startTransition] = React.useTransition();

  const selectedBanner = banners.find((banner) => banner.id === selectedId) ?? banners[0] ?? null;
  const stats = calculateStats(banners);

  React.useEffect(() => {
    setEditor(createEditorState(selectedBanner));
  }, [selectedBanner]);

  function syncBanner(banner: CmsBanner) {
    setBanners((current) => {
      const next = current.some((item) => item.id === banner.id)
        ? current.map((item) => (item.id === banner.id ? banner : item))
        : [banner, ...current];

      return sortBanners(next);
    });
    setSelectedId(banner.id);
    setEditor(createEditorState(banner));
  }

  function addMediaAsset(asset: CmsMediaAsset) {
    setMediaAssets((current) => {
      if (current.some((item) => item.id === asset.id)) {
        return current.map((item) => (item.id === asset.id ? asset : item));
      }

      return [asset, ...current];
    });
  }

  function handleCreateDraft() {
    startTransition(async () => {
      setPendingAction("create");
      setFeedback(null);

      try {
        const result = await createCmsBannerDraft();

        if (!result.success) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        syncBanner(result.banner);
        setFeedback({ tone: "success", message: result.message });
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleSave() {
    if (!selectedBanner) return;

    startTransition(async () => {
      setPendingAction("save");
      setFeedback(null);

      try {
        const result = await saveCmsBanner({
          bannerId: selectedBanner.id,
          title: editor.title,
          placement: editor.placement,
          status: editor.status,
          desktopImageUrl: editor.desktopImageUrl,
          mobileImageUrl: editor.mobileImageUrl,
          altText: editor.altText,
          targetUrl: editor.targetUrl,
          startsAt: editor.startsAt,
          endsAt: editor.endsAt,
          sortOrder: editor.sortOrder,
        });

        if (!result.success) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        syncBanner(result.banner);
        setFeedback({ tone: "success", message: result.message });
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleDelete() {
    if (!selectedBanner) return;
    if (!window.confirm(`Delete "${selectedBanner.title}"?`)) return;

    startTransition(async () => {
      setPendingAction("delete");
      setFeedback(null);

      try {
        const result = await deleteCmsBanner(selectedBanner.id);

        if (!result.success) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        setBanners((current) => current.filter((banner) => banner.id !== result.bannerId));
        setSelectedId("");
        setFeedback({ tone: "success", message: result.message });
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Ads & Banners"
        action={
          <button
            type="button"
            onClick={handleCreateDraft}
            className={cn(adminPrimaryButtonClass, "gap-2")}
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            {pendingAction === "create" ? "Creating..." : "Add banner"}
          </button>
        }
      />

      {!data.schemaReady ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">cms_banners</span> table is not available yet. Apply the
          CMS banners migration before managing campaigns.
        </div>
      ) : null}

      {feedback ? (
        <div
          className={cn(
            adminSurfaceClass,
            "px-5 py-4 text-[13px]",
            feedback.tone === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Live campaigns"
          value={stats.live.toLocaleString("en-KE")}
          icon={<FileBadge2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Scheduled"
          value={stats.scheduled.toLocaleString("en-KE")}
          icon={<Bell className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Average CTR"
          value={`${stats.averageCtr.toFixed(2)}%`}
          icon={<Eye className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Expiring soon"
          value={stats.expiringSoon.toLocaleString("en-KE")}
          icon={<ImageIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminSectionCard
          title="Campaigns"
          description="Reusable banner campaigns by placement, schedule, and status."
          bodyClassName="p-0"
        >
          <div className="divide-y divide-[#eef2f7]">
            {banners.length === 0 ? (
              <div className="px-6 py-8 text-[14px] text-[#6b7280]">
                No banner campaigns exist yet. Create a draft to start.
              </div>
            ) : null}

            {banners.map((banner) => {
              const isActive = banner.id === selectedBanner?.id;

              return (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(banner.id);
                    setFeedback(null);
                  }}
                  className={cn(
                    "w-full px-5 py-4 text-left transition",
                    isActive ? "bg-[#f8fbff]" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#111827]">
                        {banner.title}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {CMS_BANNER_PLACEMENT_LABELS[banner.placement]} • #{banner.sortOrder}
                      </p>
                    </div>
                    <AdminStatusPill
                      label={getStatusLabel(banner)}
                      tone={statusTone(banner.status, banner.isCurrentlyLive)}
                    />
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-[#475467]">
                    {getRunPeriod(banner)}
                  </p>
                  <p className="mt-2 text-[11px] text-[#94a3b8]">{formatCtr(banner)}</p>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title={selectedBanner ? selectedBanner.title : "Banner editor"}
          description="Configure placement, creative, link target, schedule, and activation state."
          action={
            selectedBanner ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={cn(adminGhostButtonClass, "gap-2")}
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {pendingAction === "delete" ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className={cn(adminPrimaryButtonClass, "gap-2")}
                  onClick={handleSave}
                  disabled={isPending}
                >
                  <Save className="h-4 w-4" />
                  {pendingAction === "save" ? "Saving..." : "Save banner"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedBanner ? (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-[#f8fafc]">
                {editor.desktopImageUrl ? (
                  <img
                    src={editor.desktopImageUrl}
                    alt={editor.altText || editor.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-[13px] text-[#94a3b8]">
                    No desktop creative selected
                  </div>
                )}
                <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">{editor.title}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {CMS_BANNER_PLACEMENT_LABELS[editor.placement]}
                    </p>
                  </div>
                  <AdminStatusPill
                    label={editor.status.charAt(0).toUpperCase() + editor.status.slice(1)}
                    tone={
                      editor.status === "active"
                        ? "green"
                        : editor.status === "paused"
                          ? "amber"
                          : "slate"
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Campaign title</span>
                  <input
                    value={editor.title}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, title: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="Homepage hero leaderboard"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Placement</span>
                  <select
                    value={editor.placement}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        placement: event.target.value as CmsBannerPlacement,
                      }))
                    }
                    className={adminSelectClass}
                  >
                    {CMS_BANNER_PLACEMENTS.map((placement) => (
                      <option key={placement} value={placement}>
                        {CMS_BANNER_PLACEMENT_LABELS[placement]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Status</span>
                  <select
                    value={editor.status}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        status: event.target.value as CmsBannerStatus,
                      }))
                    }
                    className={adminSelectClass}
                  >
                    {CMS_BANNER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Sort order</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={editor.sortOrder}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        sortOrder: Number(event.target.value),
                      }))
                    }
                    className={adminInputClass}
                  />
                </label>
              </div>

              <div className="grid gap-5">
                <AdminCmsMediaField
                  assets={mediaAssets}
                  schemaReady={mediaData.schemaReady}
                  value={editor.desktopImageUrl}
                  label="Desktop creative"
                  description="Primary banner image for desktop and tablet placements."
                  placeholder="/api/listing-image?key=..."
                  usageContext="banner"
                  onChange={(desktopImageUrl) =>
                    setEditor((current) => ({ ...current, desktopImageUrl }))
                  }
                  onAssetUploaded={addMediaAsset}
                  onFeedback={setFeedback}
                />

                <AdminCmsMediaField
                  assets={mediaAssets}
                  schemaReady={mediaData.schemaReady}
                  value={editor.mobileImageUrl}
                  label="Mobile creative"
                  description="Optional mobile-specific image. Desktop creative is used when empty."
                  placeholder="/api/listing-image?key=..."
                  usageContext="banner"
                  onChange={(mobileImageUrl) =>
                    setEditor((current) => ({ ...current, mobileImageUrl }))
                  }
                  onAssetUploaded={addMediaAsset}
                  onFeedback={setFeedback}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Target URL</span>
                  <input
                    value={editor.targetUrl}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, targetUrl: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="/search?make=Toyota"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Start date</span>
                  <input
                    type="datetime-local"
                    value={editor.startsAt}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, startsAt: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">End date</span>
                  <input
                    type="datetime-local"
                    value={editor.endsAt}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, endsAt: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Performance</span>
                  <input
                    readOnly
                    value={`${selectedBanner.clickCount.toLocaleString("en-KE")} clicks / ${selectedBanner.impressionCount.toLocaleString("en-KE")} views`}
                    className={cn(adminInputClass, "bg-[#f8fafc] text-[#6b7280]")}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[13px] font-medium text-[#374151]">Alt text</span>
                <textarea
                  value={editor.altText}
                  onChange={(event) =>
                    setEditor((current) => ({ ...current, altText: event.target.value }))
                  }
                  className={cn(adminTextareaClass, "min-h-[88px]")}
                  placeholder="Short accessible description for the banner image."
                />
              </label>
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#cbd5e1] px-6 py-8 text-[14px] text-[#64748b]">
              Create a draft or pick a campaign to start editing.
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
