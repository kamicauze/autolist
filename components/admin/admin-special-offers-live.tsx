"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Gift,
  Plus,
  Save,
  Tag,
  Users,
} from "lucide-react";
import {
  createCmsSpecialOfferDraft,
  saveCmsSpecialOffer,
} from "@/lib/actions/cms-special-offers";
import { AdminCmsMediaField } from "@/components/admin/admin-cms-media-library";
import type { AdminCmsMediaData, CmsMediaAsset } from "@/lib/types/cms-media";
import type {
  AdminCmsSpecialOffersData,
  CmsSpecialOffer,
  CmsSpecialOfferStatus,
} from "@/lib/types/cms-special-offers";
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
  adminTextareaClass,
} from "./admin-ui";

type FeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

type PendingAction = "create" | "save" | null;

type EditorState = {
  title: string;
  audience: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  status: CmsSpecialOfferStatus;
  startsAt: string;
  endsAt: string;
  redemptionCount: string;
  sortOrder: string;
};

function toDateTimeInputValue(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function createEditorState(offer: CmsSpecialOffer | null): EditorState {
  return {
    title: offer?.title ?? "",
    audience: offer?.audience ?? "All visitors",
    description: offer?.description ?? "",
    imageUrl: offer?.imageUrl ?? "",
    targetUrl: offer?.targetUrl ?? "",
    status: offer?.status ?? "draft",
    startsAt: toDateTimeInputValue(offer?.startsAt ?? null),
    endsAt: toDateTimeInputValue(offer?.endsAt ?? null),
    redemptionCount: String(offer?.redemptionCount ?? 0),
    sortOrder: String(offer?.sortOrder ?? 0),
  };
}

function sortOffers(offers: CmsSpecialOffer[]) {
  return [...offers].sort((left, right) => {
    const orderDifference = left.sortOrder - right.sortOrder;
    if (orderDifference !== 0) return orderDifference;

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function isScheduledOffer(offer: Pick<CmsSpecialOffer, "status" | "startsAt">) {
  return (
    offer.status === "active" &&
    Boolean(offer.startsAt) &&
    new Date(offer.startsAt!).getTime() > Date.now()
  );
}

function isEndedOffer(offer: Pick<CmsSpecialOffer, "status" | "endsAt">) {
  return (
    offer.status === "active" &&
    Boolean(offer.endsAt) &&
    new Date(offer.endsAt!).getTime() < Date.now()
  );
}

function calculateStats(offers: CmsSpecialOffer[]) {
  return {
    total: offers.length,
    live: offers.filter((offer) => offer.isCurrentlyLive).length,
    scheduled: offers.filter(isScheduledOffer).length,
    paused: offers.filter((offer) => offer.status === "paused").length,
    totalRedemptions: offers.reduce((sum, offer) => sum + offer.redemptionCount, 0),
  };
}

function getOfferStatusLabel(offer: CmsSpecialOffer) {
  if (offer.status === "draft") return "Draft";
  if (offer.status === "paused") return "Paused";
  if (isScheduledOffer(offer)) return "Scheduled";
  if (isEndedOffer(offer)) return "Ended";
  return "Active";
}

function getOfferStatusTone(offer: CmsSpecialOffer) {
  if (offer.status === "draft") return "slate" as const;
  if (offer.status === "paused") return "amber" as const;
  if (isScheduledOffer(offer)) return "blue" as const;
  if (isEndedOffer(offer)) return "slate" as const;
  return "green" as const;
}

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRunWindow(offer: CmsSpecialOffer) {
  if (!offer.startsAt && !offer.endsAt) return "Always available";
  if (offer.startsAt && offer.endsAt) {
    return `${formatDateTime(offer.startsAt)} - ${formatDateTime(offer.endsAt)}`;
  }
  if (offer.startsAt) return `Starts ${formatDateTime(offer.startsAt)}`;
  return `Ends ${formatDateTime(offer.endsAt)}`;
}

function getOfferImageStyle(imageUrl: string): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.42)), url("${imageUrl.replace(/"/g, '\\"')}")`,
  };
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function AdminSpecialOffersLive({
  data,
  mediaData,
}: {
  data: AdminCmsSpecialOffersData;
  mediaData: AdminCmsMediaData;
}) {
  const [offers, setOffers] = React.useState(() => sortOffers(data.offers));
  const [mediaAssets, setMediaAssets] = React.useState(mediaData.assets);
  const [selectedId, setSelectedId] = React.useState(data.offers[0]?.id ?? "");
  const [editor, setEditor] = React.useState(() => createEditorState(data.offers[0] ?? null));
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);
  const [isPending, startTransition] = React.useTransition();

  const selectedOffer = offers.find((offer) => offer.id === selectedId) ?? offers[0] ?? null;
  const stats = calculateStats(offers);
  const targetHref = editor.targetUrl.trim();

  React.useEffect(() => {
    setEditor(createEditorState(selectedOffer));
    setFeedback(null);
  }, [selectedOffer]);

  function syncOffer(offer: CmsSpecialOffer) {
    setOffers((current) => {
      const next = current.some((item) => item.id === offer.id)
        ? current.map((item) => (item.id === offer.id ? offer : item))
        : [offer, ...current];

      return sortOffers(next);
    });

    setSelectedId(offer.id);
    setEditor(createEditorState(offer));
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
        const result = await createCmsSpecialOfferDraft();

        if (!result.success) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        syncOffer(result.offer);
        setFeedback({ tone: "success", message: result.message });
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleSaveChanges() {
    if (!selectedOffer) return;

    startTransition(async () => {
      setPendingAction("save");
      setFeedback(null);

      try {
        const result = await saveCmsSpecialOffer({
          offerId: selectedOffer.id,
          title: editor.title,
          audience: editor.audience,
          description: editor.description,
          imageUrl: editor.imageUrl,
          targetUrl: editor.targetUrl,
          status: editor.status,
          startsAt: editor.startsAt,
          endsAt: editor.endsAt,
          redemptionCount: parseInteger(editor.redemptionCount),
          sortOrder: parseInteger(editor.sortOrder),
        });

        if (!result.success) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        syncOffer(result.offer);
        setFeedback({ tone: "success", message: result.message });
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Special Offers"
        action={
          <button
            type="button"
            className={cn(adminPrimaryButtonClass, "gap-2", isPending && "opacity-60")}
            onClick={handleCreateDraft}
            disabled={isPending || !data.schemaReady}
          >
            <Plus className="h-4 w-4" />
            {pendingAction === "create" ? "Creating..." : "New offer"}
          </button>
        }
      />

      {!data.schemaReady ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">cms_special_offers</span> table is not available yet.
          Apply the latest Supabase migration before managing special offers.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Total offers"
          value={stats.total.toLocaleString("en-KE")}
          icon={<Gift className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Live now"
          value={stats.live.toLocaleString("en-KE")}
          icon={<Tag className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Scheduled"
          value={stats.scheduled.toLocaleString("en-KE")}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Redemptions"
          value={stats.totalRedemptions.toLocaleString("en-KE")}
          icon={<Users className="h-5 w-5" />}
          note={stats.paused > 0 ? `${stats.paused} paused` : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminSectionCard
          data-tour="offers-list"
          title="Offers"
          description="Create, schedule, pause, and order CMS-managed promotional offers."
          bodyClassName="p-0"
        >
          <div className="divide-y divide-[#eef2f7]">
            {offers.length === 0 ? (
              <div className="px-6 py-8 text-[14px] text-[#6b7280]">
                No offers exist yet. Create an offer draft to start the promotion library.
              </div>
            ) : null}

            {offers.map((offer) => {
              const isActive = offer.id === selectedOffer?.id;

              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedId(offer.id)}
                  className={cn(
                    "w-full px-6 py-5 text-left transition",
                    isActive ? "bg-brand-soft-surface" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-16 w-20 shrink-0 rounded-[10px] border border-[#e5e7eb] bg-[#f1f5f9] bg-cover bg-center",
                        !offer.imageUrl && "flex items-center justify-center"
                      )}
                      style={offer.imageUrl ? getOfferImageStyle(offer.imageUrl) : undefined}
                    >
                      {!offer.imageUrl ? <Gift className="h-5 w-5 text-[#94a3b8]" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-[#111827]">
                            {offer.title}
                          </p>
                          <p className="mt-1 truncate text-[12px] text-[#6b7280]">
                            {offer.audience}
                          </p>
                        </div>
                        <AdminStatusPill
                          label={getOfferStatusLabel(offer)}
                          tone={getOfferStatusTone(offer)}
                        />
                      </div>
                      <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#475467]">
                        {offer.description || "No offer description yet."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#94a3b8]">
                    <span>Order {offer.sortOrder}</span>
                    <span>{offer.redemptionCount.toLocaleString("en-KE")} redemptions</span>
                    <span>{getRunWindow(offer)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          data-tour="offers-editor"
          title={selectedOffer ? selectedOffer.title : "Offer editor"}
          description={
            selectedOffer
              ? "Edit the selected offer, update its schedule, then save the record."
              : "Select an existing offer or create a draft."
          }
          action={
            selectedOffer ? (
              <div className="flex flex-wrap gap-3">
                {targetHref ? (
                  <a
                    href={targetHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(adminGhostButtonClass, "gap-2")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open target
                  </a>
                ) : null}
                <button
                  type="button"
                  className={cn(adminPrimaryButtonClass, "gap-2", isPending && "opacity-60")}
                  onClick={handleSaveChanges}
                  disabled={isPending}
                >
                  <Save className="h-4 w-4" />
                  {pendingAction === "save" ? "Saving..." : "Save offer"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedOffer ? (
            <div className="space-y-5">
              {feedback ? (
                <div
                  className={cn(
                    "rounded-[12px] border px-4 py-3 text-[13px]",
                    feedback.tone === "success"
                      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
                      : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                  )}
                >
                  {feedback.message}
                </div>
              ) : null}

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-[#374151]">Title</span>
                      <input
                        value={editor.title}
                        onChange={(event) =>
                          setEditor((current) => ({ ...current, title: event.target.value }))
                        }
                        className={adminInputClass}
                        placeholder="Dealer package discount"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-[#374151]">Audience</span>
                      <input
                        value={editor.audience}
                        onChange={(event) =>
                          setEditor((current) => ({ ...current, audience: event.target.value }))
                        }
                        className={adminInputClass}
                        placeholder="Dealers, first-time sellers, all buyers"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-[#374151]">Status</span>
                      <select
                        value={editor.status}
                        onChange={(event) =>
                          setEditor((current) => ({
                            ...current,
                            status: event.target.value as CmsSpecialOfferStatus,
                          }))
                        }
                        className={adminSelectClass}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-[#374151]">Sort order</span>
                      <input
                        type="number"
                        min={0}
                        value={editor.sortOrder}
                        onChange={(event) =>
                          setEditor((current) => ({ ...current, sortOrder: event.target.value }))
                        }
                        className={adminInputClass}
                      />
                    </label>
                  </div>

                  <AdminCmsMediaField
                    assets={mediaAssets}
                    schemaReady={mediaData.schemaReady}
                    value={editor.imageUrl}
                    label="Offer image"
                    description="Upload or select a reusable image for this offer."
                    placeholder="/api/listing-image?key=..."
                    usageContext="offer"
                    onChange={(imageUrl) =>
                      setEditor((current) => ({ ...current, imageUrl }))
                    }
                    onAssetUploaded={addMediaAsset}
                    onFeedback={setFeedback}
                  />

                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-[#374151]">Target URL</span>
                    <input
                      value={editor.targetUrl}
                      onChange={(event) =>
                        setEditor((current) => ({ ...current, targetUrl: event.target.value }))
                      }
                      className={adminInputClass}
                      placeholder="/sell or https://partner.example.com/promo"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-[#374151]">Description</span>
                    <textarea
                      value={editor.description}
                      onChange={(event) =>
                        setEditor((current) => ({ ...current, description: event.target.value }))
                      }
                      className={cn(adminTextareaClass, "min-h-[150px]")}
                      placeholder="Short promotional copy shown with the offer."
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-[#374151]">Starts at</span>
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
                      <span className="text-[13px] font-medium text-[#374151]">Ends at</span>
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
                      <span className="text-[13px] font-medium text-[#374151]">
                        Redemption count
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={editor.redemptionCount}
                        onChange={(event) =>
                          setEditor((current) => ({
                            ...current,
                            redemptionCount: event.target.value,
                          }))
                        }
                        className={adminInputClass}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className={cn(
                      "flex aspect-[4/3] items-end rounded-[14px] border border-[#e5e7eb] bg-[#f1f5f9] bg-cover bg-center p-4",
                      !editor.imageUrl && "items-center justify-center"
                    )}
                    style={editor.imageUrl ? getOfferImageStyle(editor.imageUrl) : undefined}
                  >
                    {editor.imageUrl ? (
                      <div className="max-w-full rounded-[10px] bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                        <p className="truncate text-[14px] font-semibold text-[#111827]">
                          {editor.title || "Untitled offer"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#475467]">
                          {editor.description || "Offer description preview"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-[13px] text-[#94a3b8]">
                        <Gift className="mx-auto h-7 w-7" />
                        <p className="mt-2">No offer image selected</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                      <p className="text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">
                        Current status
                      </p>
                      <div className="mt-3">
                        <AdminStatusPill
                          label={getOfferStatusLabel(selectedOffer)}
                          tone={getOfferStatusTone(selectedOffer)}
                        />
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                      <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">
                        <Clock3 className="h-4 w-4" />
                        Run window
                      </div>
                      <p className="mt-3 text-[14px] font-medium leading-6 text-[#111827]">
                        {getRunWindow(selectedOffer)}
                      </p>
                    </div>

                    <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                      <p className="text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">
                        Updated
                      </p>
                      <p className="mt-3 text-[14px] font-medium text-[#111827]">
                        {formatDateTime(selectedOffer.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#cbd5e1] px-6 py-8 text-[14px] text-[#64748b]">
              Create a draft or pick an existing offer to start editing.
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
