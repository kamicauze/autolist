/* eslint-disable @next/next/no-img-element */

"use client";

import * as React from "react";
import {
  Bell,
  Check,
  Eye,
  FileBadge2,
  ImageIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createCmsBannerDraft,
  deleteCmsBanner,
  saveCmsBanner,
} from "@/lib/actions/cms-banners";
import { AdminCmsMediaField } from "@/components/admin/admin-cms-media-library";
import {
  CMS_BANNER_PLACEMENT_LABELS,
  CMS_BANNER_PLACEMENTS,
  CMS_BANNER_CATEGORY_TARGET_LABELS,
  CMS_BANNER_CATEGORY_TARGETS,
  CMS_BANNER_STATUSES,
  type AdminCmsBannersData,
  type CmsBanner,
  type CmsBannerCategoryTarget,
  type CmsBannerPlacement,
  type CmsBannerStatus,
} from "@/lib/types/cms-banners";
import type { AdminCmsMediaData, CmsMediaAsset } from "@/lib/types/cms-media";
import { cn } from "@/lib/utils";
import {
  AdminConfirmDialog,
  AdminFeedbackBanner,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  type AdminFeedbackState,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "./admin-ui";

type PendingAction = "create" | "save" | "delete" | null;

type BannerEditorState = {
  title: string;
  slug: string;
  placement: CmsBannerPlacement;
  categoryTargets: CmsBannerCategoryTarget[];
  status: CmsBannerStatus;
  desktopImageUrl: string;
  mobileImageUrl: string;
  altText: string;
  summary: string;
  body: string;
  ctaLabel: string;
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
    slug: banner?.slug ?? "",
    placement: banner?.placement ?? "home_top",
    categoryTargets: banner?.categoryTargets ?? [],
    status: banner?.status ?? "draft",
    desktopImageUrl: banner?.desktopImageUrl ?? "",
    mobileImageUrl: banner?.mobileImageUrl ?? "",
    altText: banner?.altText ?? "",
    summary: banner?.summary ?? "",
    body: banner?.body ?? "",
    ctaLabel: banner?.ctaLabel ?? "",
    targetUrl: banner?.targetUrl ?? "",
    startsAt: toDateTimeLocal(banner?.startsAt ?? null),
    endsAt: toDateTimeLocal(banner?.endsAt ?? null),
    sortOrder: banner?.sortOrder ?? 0,
  };
}

function parseSortOrderInput(value: string) {
  if (!value.trim()) return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;

  return Math.min(999, Math.max(0, Math.trunc(parsed)));
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

const PLACEMENT_PREVIEW_DETAILS: Record<
  CmsBannerPlacement,
  {
    page: string;
    slot: string;
    description: string;
    highlight: "hero" | "top" | "rail" | "sidebar" | "detail" | "dashboard";
  }
> = {
  home_hero: {
    page: "Homepage",
    slot: "Hero takeover",
    description: "Large banner above the homepage search experience.",
    highlight: "hero",
  },
  home_top: {
    page: "Homepage",
    slot: "Top banner",
    description: "Wide banner directly below the homepage hero.",
    highlight: "top",
  },
  home_featured: {
    page: "Homepage",
    slot: "Featured rail follow-up",
    description: "Compact banner below the recent activities listing rail.",
    highlight: "rail",
  },
  listing_global_top: {
    page: "Listings",
    slot: "Global listing banner",
    description: "Compact banner above listing/search content and vehicle details.",
    highlight: "top",
  },
  search_top: {
    page: "Search",
    slot: "Search results banner",
    description: "Compact banner between the search heading and result controls.",
    highlight: "top",
  },
  search_sidebar: {
    page: "Search",
    slot: "Search side columns",
    description: "Tall side banners flanking desktop search results.",
    highlight: "sidebar",
  },
  vehicle_detail: {
    page: "Vehicle detail",
    slot: "Detail side columns",
    description: "Tall side banners flanking vehicle details on desktop.",
    highlight: "detail",
  },
  dashboard: {
    page: "Dashboard",
    slot: "Dashboard sidebar",
    description: "Sidebar banner stack for signed-in account dashboards.",
    highlight: "dashboard",
  },
  ad_detail_hero: {
    page: "Ad detail",
    slot: "Sponsor page hero",
    description: "Large banner at the top of the CMS-managed ad detail page.",
    highlight: "hero",
  },
  ad_detail_sidebar: {
    page: "Ad detail",
    slot: "Sponsor page side columns",
    description: "Tall side banners beside the CMS-managed ad detail body.",
    highlight: "sidebar",
  },
};

function getCategoryTargetSummary(targets: CmsBannerCategoryTarget[]) {
  if (targets.length === 0) return "All categories";
  return targets.map((target) => CMS_BANNER_CATEGORY_TARGET_LABELS[target]).join(", ");
}

function PlacementMiniMap({
  highlight,
}: {
  highlight: (typeof PLACEMENT_PREVIEW_DETAILS)[CmsBannerPlacement]["highlight"];
}) {
  return (
    <div className="rounded-[12px] border border-[#d9e2ec] bg-[#f8fafc] p-2">
      <div className="overflow-hidden rounded-[8px] border border-[#d1d5db] bg-white">
        <div className="h-2.5 bg-[#1f2937]" />
        <div className="space-y-1.5 p-2">
          <div
            className={cn(
              "h-8 rounded-[6px] border",
              highlight === "hero"
                ? "border-primary bg-brand-tint-strong"
                : "border-[#e5e7eb] bg-[#eef2f7]"
            )}
          />
          <div
            className={cn(
              "h-3 rounded-[4px] border",
              highlight === "top"
                ? "border-primary bg-brand-tint-strong"
                : "border-[#e5e7eb] bg-[#f8fafc]"
            )}
          />
          <div className="grid grid-cols-[18px_minmax(0,1fr)_18px] gap-1.5">
            <div
              className={cn(
                "h-16 rounded-[4px] border",
                highlight === "sidebar" || highlight === "detail"
                  ? "border-primary bg-brand-tint-strong"
                  : "border-[#e5e7eb] bg-[#f8fafc]"
              )}
            />
            <div className="space-y-1">
              <div
                className={cn(
                  "h-5 rounded-[4px] border",
                  highlight === "rail"
                    ? "border-primary bg-brand-tint-strong"
                    : "border-[#e5e7eb] bg-[#f8fafc]"
                )}
              />
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "h-8 rounded-[4px] border",
                      highlight === "dashboard" && item === 2
                        ? "border-primary bg-brand-tint-strong"
                        : "border-[#e5e7eb] bg-[#f1f5f9]"
                    )}
                  />
                ))}
              </div>
            </div>
            <div
              className={cn(
                "h-16 rounded-[4px] border",
                highlight === "sidebar" || highlight === "detail" || highlight === "dashboard"
                  ? "border-primary bg-brand-tint-strong"
                  : "border-[#e5e7eb] bg-[#f8fafc]"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewBannerCreative({
  editor,
  mode = "wide",
}: {
  editor: BannerEditorState;
  mode?: "wide" | "tall" | "hero";
}) {
  const imageUrl = editor.desktopImageUrl || editor.mobileImageUrl;
  const title = editor.title.trim() || "Banner title";
  const summary = editor.summary.trim();
  const ctaLabel = editor.ctaLabel.trim() || "View offer";

  return (
    <div
      className={cn(
        "relative isolate flex min-h-[128px] overflow-hidden rounded-[14px] border border-primary bg-[#eff6ff]",
        mode === "tall" ? "h-full min-h-[280px]" : null,
        mode === "hero" ? "min-h-[220px]" : null
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={editor.altText || title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#dbeafe] text-[12px] font-semibold text-primary">
          No creative selected
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.78),rgba(15,23,42,0.2))]" />
      <div
        className={cn(
          "relative mt-auto flex w-full flex-col items-start gap-2 p-4 text-white",
          mode === "tall" ? "justify-end" : "sm:max-w-[70%]"
        )}
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/75">
          Preview
        </p>
        <p className={cn("font-semibold leading-tight", mode === "hero" ? "text-[22px]" : "text-[16px]")}>
          {title}
        </p>
        {summary ? (
          <p className="line-clamp-2 text-[12px] leading-5 text-white/85">{summary}</p>
        ) : null}
        <span className="mt-1 inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-semibold text-[#111827]">
          {ctaLabel}
        </span>
      </div>
    </div>
  );
}

function PlaceholderBlock({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[10px] border border-dashed border-[#d1d5db] bg-[#f8fafc] text-[11px] font-medium text-[#94a3b8]",
        className
      )}
    >
      {label}
    </div>
  );
}

function PlacementPreviewMockup({ editor }: { editor: BannerEditorState }) {
  const detail = PLACEMENT_PREVIEW_DETAILS[editor.placement];
  const highlight = detail.highlight;
  const isHero = highlight === "hero";
  const isTop = highlight === "top";
  const isRail = highlight === "rail";
  const isSidebar = highlight === "sidebar";
  const isDetail = highlight === "detail";
  const isDashboard = highlight === "dashboard";

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d9e2ec] bg-[#f8fafc] shadow-[0_18px_48px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 rounded-[8px] bg-[#111827]" />
          <div className="hidden h-3 w-28 rounded-full bg-[#e5e7eb] sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-16 rounded-full bg-[#e5e7eb]" />
          <div className="h-7 w-20 rounded-full bg-primary" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        {isHero ? (
          <PreviewBannerCreative editor={editor} mode="hero" />
        ) : (
          <PlaceholderBlock className="min-h-[170px]" label={`${detail.page} hero area`} />
        )}

        {isTop ? (
          <PreviewBannerCreative editor={editor} />
        ) : (
          <PlaceholderBlock className="min-h-[70px]" label="Top content slot" />
        )}

        <div
          className={cn(
            "grid gap-4",
            isDashboard
              ? "lg:grid-cols-[minmax(0,1fr)_220px]"
              : "lg:grid-cols-[160px_minmax(0,1fr)_160px]"
          )}
        >
          {!isDashboard ? (
            <div className="hidden lg:block">
              {isSidebar || isDetail ? (
                <PreviewBannerCreative editor={editor} mode="tall" />
              ) : (
                <PlaceholderBlock className="h-full min-h-[320px]" label="Left ad rail" />
              )}
            </div>
          ) : null}

          <div className="space-y-4">
            {isRail ? (
              <PreviewBannerCreative editor={editor} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <PlaceholderBlock key={item} className="min-h-[116px]" label="Listing card" />
                ))}
              </div>
            )}

            <div className="space-y-3 rounded-[14px] border border-[#e5e7eb] bg-white p-4">
              <div className="h-4 w-2/5 rounded-full bg-[#dbe2ea]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <PlaceholderBlock className="min-h-[88px]" />
                <PlaceholderBlock className="min-h-[88px]" />
              </div>
              <PlaceholderBlock className="min-h-[74px]" />
            </div>
          </div>

          <div className={cn(isDashboard ? "block" : "hidden lg:block")}>
            {isDashboard ? (
              <div className="space-y-3">
                <PlaceholderBlock className="min-h-[88px]" label="Dashboard summary" />
                <PreviewBannerCreative editor={editor} mode="tall" />
              </div>
            ) : isSidebar || isDetail ? (
              <PreviewBannerCreative editor={editor} mode="tall" />
            ) : (
              <PlaceholderBlock className="h-full min-h-[320px]" label="Right ad rail" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerPlacementPreviewDialog({
  open,
  onOpenChange,
  editor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: BannerEditorState;
}) {
  const detail = PLACEMENT_PREVIEW_DETAILS[editor.placement];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#e5e7eb] bg-white sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] text-[#111827]">Preview placement</DialogTitle>
          <DialogDescription className="text-[13px] leading-5 text-[#64748b]">
            Unsaved preview for {CMS_BANNER_PLACEMENT_LABELS[editor.placement]} on {detail.page}.
            Visitors will not see this until the banner is saved, active, and within its schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                Page area
              </p>
              <p className="mt-1 text-[14px] font-semibold text-[#111827]">{detail.slot}</p>
              <p className="mt-2 text-[12px] leading-5 text-[#64748b]">{detail.description}</p>
            </div>
            <div className="border-t border-[#e5e7eb] pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                Category scope
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#111827]">
                {getCategoryTargetSummary(editor.categoryTargets)}
              </p>
            </div>
            <div className="border-t border-[#e5e7eb] pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                Publish state
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#111827]">
                {editor.status.charAt(0).toUpperCase() + editor.status.slice(1)}
              </p>
              <p className="mt-2 text-[12px] leading-5 text-[#64748b]">
                Preview does not publish or save changes.
              </p>
            </div>
          </div>

          <PlacementPreviewMockup editor={editor} />
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [feedback, setFeedback] = React.useState<AdminFeedbackState>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
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

  function toggleCategoryTarget(target: CmsBannerCategoryTarget) {
    setEditor((current) => {
      const exists = current.categoryTargets.includes(target);
      return {
        ...current,
        categoryTargets: exists
          ? current.categoryTargets.filter((item) => item !== target)
          : [...current.categoryTargets, target],
      };
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
          slug: editor.slug,
          placement: editor.placement,
          categoryTargets: editor.categoryTargets,
          status: editor.status,
          desktopImageUrl: editor.desktopImageUrl,
          mobileImageUrl: editor.mobileImageUrl,
          altText: editor.altText,
          summary: editor.summary,
          body: editor.body,
          ctaLabel: editor.ctaLabel,
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
        setDeleteDialogOpen(false);
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

      <AdminFeedbackBanner feedback={feedback} />

      <div data-tour="ads-stats" className="grid gap-4 xl:grid-cols-4">
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
          data-tour="ads-list"
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
                    isActive ? "bg-brand-soft-surface" : "bg-white hover:bg-[#fafcff]"
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
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {getCategoryTargetSummary(banner.categoryTargets)}
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
          data-tour="ads-editor"
          title={selectedBanner ? selectedBanner.title : "Banner editor"}
          description="Configure placement, creative, link target, schedule, and activation state."
          action={
            selectedBanner ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={cn(adminGhostButtonClass, "gap-2")}
                  onClick={() => setPreviewDialogOpen(true)}
                  disabled={isPending}
                >
                  <Eye className="h-4 w-4" />
                  Preview placement
                </button>
                <button
                  type="button"
                  className={cn(adminGhostButtonClass, "gap-2")}
                  onClick={() => setDeleteDialogOpen(true)}
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
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {getCategoryTargetSummary(editor.categoryTargets)}
                    </p>
                    {selectedBanner.slug ? (
                      <p className="mt-1 text-[12px] text-[#94a3b8]">/ads/{selectedBanner.slug}</p>
                    ) : null}
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
                  <span className="text-[13px] font-medium text-[#374151]">Ad page slug</span>
                  <input
                    value={editor.slug}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, slug: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="toyota-finance-may"
                  />
                </label>

                <div className="space-y-3 md:col-span-2">
                  <div>
                    <p className="text-[13px] font-medium text-[#374151]">Placement</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                      Choose the page area where this banner will appear.
                    </p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {CMS_BANNER_PLACEMENTS.map((placement) => {
                      const detail = PLACEMENT_PREVIEW_DETAILS[placement];
                      const selected = editor.placement === placement;

                      return (
                        <button
                          key={placement}
                          type="button"
                          onClick={() =>
                            setEditor((current) => ({
                              ...current,
                              placement,
                            }))
                          }
                          className={cn(
                            "grid min-h-[150px] grid-cols-1 gap-3 rounded-[14px] border p-3 text-left transition active:translate-y-[1px] sm:grid-cols-[112px_minmax(0,1fr)]",
                            selected
                              ? "border-primary bg-brand-soft-surface"
                              : "border-[#e5e7eb] bg-white hover:border-[#bfdbfe]"
                          )}
                          aria-pressed={selected}
                        >
                          <PlacementMiniMap highlight={detail.highlight} />
                          <span className="min-w-0">
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-[13px] font-semibold text-[#111827]">
                                {CMS_BANNER_PLACEMENT_LABELS[placement]}
                              </span>
                              {selected ? (
                                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                              {detail.page} / {detail.slot}
                            </span>
                            <span className="mt-2 block text-[12px] leading-5 text-[#64748b]">
                              {detail.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div>
                    <p className="text-[13px] font-medium text-[#374151]">Category targeting</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                      Leave all categories off for a global banner, or choose the listing categories
                      where this campaign should appear.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditor((current) => ({
                          ...current,
                          categoryTargets: [],
                        }))
                      }
                      className={cn(
                        "inline-flex h-10 items-center justify-center rounded-[10px] border px-3 text-[13px] font-semibold transition active:translate-y-[1px]",
                        editor.categoryTargets.length === 0
                          ? "border-primary bg-primary text-white"
                          : "border-[#d1d5db] bg-white text-[#374151] hover:border-primary hover:text-primary"
                      )}
                      aria-pressed={editor.categoryTargets.length === 0}
                    >
                      All categories
                    </button>
                    {CMS_BANNER_CATEGORY_TARGETS.map((target) => {
                      const selected = editor.categoryTargets.includes(target);
                      return (
                        <button
                          key={target}
                          type="button"
                          onClick={() => toggleCategoryTarget(target)}
                          className={cn(
                            "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-3 text-[13px] font-semibold transition active:translate-y-[1px]",
                            selected
                              ? "border-primary bg-primary text-white"
                              : "border-[#d1d5db] bg-white text-[#374151] hover:border-primary hover:text-primary"
                          )}
                          aria-pressed={selected}
                        >
                          {selected ? <Check className="h-3.5 w-3.5" /> : null}
                          {CMS_BANNER_CATEGORY_TARGET_LABELS[target]}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                    step={1}
                    value={editor.sortOrder}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        sortOrder: parseSortOrderInput(event.target.value),
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
                    placeholder="/search?make=Toyota or https://partner.example.com"
                  />
                  <p className="text-[12px] leading-5 text-[#6b7280]">
                    Leave empty to use the CMS-managed ad detail page at the saved slug.
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">CTA label</span>
                  <input
                    value={editor.ctaLabel}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, ctaLabel: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="View offer"
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
                <span className="text-[13px] font-medium text-[#374151]">Summary</span>
                <textarea
                  value={editor.summary}
                  onChange={(event) =>
                    setEditor((current) => ({ ...current, summary: event.target.value }))
                  }
                  className={cn(adminTextareaClass, "min-h-[88px]")}
                  placeholder="Short campaign summary shown on hero and ad detail layouts."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[13px] font-medium text-[#374151]">Body copy</span>
                <textarea
                  value={editor.body}
                  onChange={(event) =>
                    setEditor((current) => ({ ...current, body: event.target.value }))
                  }
                  className={cn(adminTextareaClass, "min-h-[160px]")}
                  placeholder="Longer sponsor details, offer terms, or campaign copy for the ad detail page."
                />
              </label>

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

      <AdminConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete banner"
        description={
          selectedBanner
            ? `Delete "${selectedBanner.title}"? This campaign will be removed from the admin editor.`
            : "Delete this campaign?"
        }
        confirmLabel="Delete banner"
        destructive
        pending={pendingAction === "delete"}
        onConfirm={handleDelete}
      />

      {selectedBanner ? (
        <BannerPlacementPreviewDialog
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          editor={editor}
        />
      ) : null}
    </div>
  );
}
