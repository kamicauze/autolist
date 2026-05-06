"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CarFront,
  CheckCircle2,
  Clock3,
  ListOrdered,
  PauseCircle,
  Pin,
  PlayCircle,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteFeaturedListingPin,
  saveFeaturedListingPin,
  searchFeaturedListingPinCandidates,
} from "@/lib/actions/featured-listing-pins";
import type { Listing } from "@/lib/types/listing";
import type {
  AdminFeaturedListingPinsData,
  FeaturedListingPin,
  FeaturedListingPinStatus,
} from "@/lib/types/featured-listing-pins";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingDisplayTitle,
  getListingSubtitle,
} from "@/lib/utils/vehicle-display";
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
} from "./admin-ui";

type FeedbackState =
  | {
      status: "success" | "error";
      message: string;
    }
  | null;

type PinEditorState = {
  sortOrder: string;
  status: FeaturedListingPinStatus;
  startsAt: string;
  endsAt: string;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDateTime(value: string | null) {
  if (!value) return "No limit";

  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function getListingCoverUrl(listing: Listing) {
  const cover = (listing.images || [])
    .slice()
    .sort((left, right) => left.image_order - right.image_order)[0];

  return getImageUrl(cover?.r2_key || "", "card");
}

function getSellerName(listing: Listing) {
  return listing.dealer?.name || listing.seller?.full_name || "Private seller";
}

function getPinEditorState(pin: FeaturedListingPin): PinEditorState {
  return {
    sortOrder: String(pin.sortOrder),
    status: pin.status,
    startsAt: toDateTimeLocalValue(pin.startsAt),
    endsAt: toDateTimeLocalValue(pin.endsAt),
  };
}

function getVisibilityTone(pin: FeaturedListingPin) {
  if (pin.visibility === "live") return "green" as const;
  if (pin.visibility === "scheduled") return "blue" as const;
  if (pin.visibility === "expired") return "red" as const;
  return "amber" as const;
}

function getVisibilityLabel(pin: FeaturedListingPin) {
  if (pin.visibility === "live") return "Live";
  if (pin.visibility === "scheduled") return "Scheduled";
  if (pin.visibility === "expired") return "Expired";
  return "Paused";
}

function nextSortOrder(pins: FeaturedListingPin[]) {
  const maxSort = pins.reduce((max, pin) => Math.max(max, pin.sortOrder), 0);
  return String(maxSort + 10);
}

function ListingSummary({
  listing,
  compact = false,
}: {
  listing: Listing;
  compact?: boolean;
}) {
  const title = getListingDisplayTitle(listing);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#eef2f7]",
          compact ? "h-14 w-20" : "h-20 w-28"
        )}
      >
        <Image
          src={getListingCoverUrl(listing)}
          alt={title}
          fill
          className="object-cover"
          sizes={compact ? "80px" : "112px"}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-[#111827]">{title}</p>
        <p className="mt-1 truncate text-[12px] text-[#6b7280]">
          {getListingSubtitle(listing) || getSellerName(listing)}
        </p>
        <p className="mt-1 text-[12px] font-semibold text-[#2563eb]">
          {formatCurrency(listing.price, listing.currency)}
        </p>
      </div>
    </div>
  );
}

function PinCard({
  pin,
  onSaved,
  onError,
  onDeleted,
  disabled,
}: {
  pin: FeaturedListingPin;
  onSaved: (pin: FeaturedListingPin, message: string) => void;
  onError: (message: string) => void;
  onDeleted: (pinId: string, message: string) => void;
  disabled: boolean;
}) {
  const [editor, setEditor] = React.useState<PinEditorState>(() => getPinEditorState(pin));
  const [isPending, startTransition] = React.useTransition();
  const isBusy = disabled || isPending;

  React.useEffect(() => {
    setEditor(getPinEditorState(pin));
  }, [pin]);

  const updateEditor = (patch: Partial<PinEditorState>) => {
    setEditor((current) => ({ ...current, ...patch }));
  };

  const handleSave = (statusOverride?: FeaturedListingPinStatus) => {
    startTransition(async () => {
      const result = await saveFeaturedListingPin({
        id: pin.id,
        listingId: pin.listingId,
        status: statusOverride ?? editor.status,
        sortOrder: Number(editor.sortOrder || 0),
        startsAt: fromDateTimeLocalValue(editor.startsAt),
        endsAt: fromDateTimeLocalValue(editor.endsAt),
      });

      if (result.success) {
        onSaved(result.pin, result.message);
      } else {
        onError(result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFeaturedListingPin(pin.id);
      if (result.success) {
        onDeleted(result.pinId, result.message);
      } else {
        onError(result.error);
      }
    });
  };

  return (
    <article className="rounded-[14px] border border-[#e5e7eb] bg-white p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <AdminStatusPill label={getVisibilityLabel(pin)} tone={getVisibilityTone(pin)} />
            <span className="text-[12px] font-medium text-[#6b7280]">
              Order {pin.sortOrder}
            </span>
          </div>
          <ListingSummary listing={pin.listing} />
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-4 xl:w-[620px]">
          <label className="min-w-0">
            <span className="mb-1 block text-[12px] font-medium text-[#374151]">
              Sort order
            </span>
            <input
              type="number"
              min="0"
              max="10000"
              value={editor.sortOrder}
              onChange={(event) => updateEditor({ sortOrder: event.target.value })}
              className={adminInputClass}
              disabled={isBusy}
            />
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-[12px] font-medium text-[#374151]">
              Status
            </span>
            <select
              value={editor.status}
              onChange={(event) =>
                updateEditor({ status: event.target.value as FeaturedListingPinStatus })
              }
              className={adminSelectClass}
              disabled={isBusy}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-[12px] font-medium text-[#374151]">
              Starts
            </span>
            <input
              type="datetime-local"
              value={editor.startsAt}
              onChange={(event) => updateEditor({ startsAt: event.target.value })}
              className={adminInputClass}
              disabled={isBusy}
            />
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-[12px] font-medium text-[#374151]">
              Ends
            </span>
            <input
              type="datetime-local"
              value={editor.endsAt}
              onChange={(event) => updateEditor({ endsAt: event.target.value })}
              className={adminInputClass}
              disabled={isBusy}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#f1f5f9] pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#6b7280]">
          <span>Starts: {formatDateTime(pin.startsAt)}</span>
          <span>Ends: {formatDateTime(pin.endsAt)}</span>
          <span>Updated: {formatDateTime(pin.updatedAt)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSave(pin.status === "active" ? "paused" : "active")}
            disabled={isBusy}
            className={adminGhostButtonClass}
          >
            {pin.status === "active" ? (
              <PauseCircle className="mr-2 h-4 w-4" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {pin.status === "active" ? "Pause" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isBusy}
            className={adminPrimaryButtonClass}
          >
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-[10px] border border-[#fecaca] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#dc2626] transition hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Unpin
          </button>
        </div>
      </div>
    </article>
  );
}

export function AdminFeaturedListingsLive({ data }: { data: AdminFeaturedListingPinsData }) {
  const router = useRouter();
  const [pins, setPins] = React.useState(data.pins);
  const [candidates, setCandidates] = React.useState(data.candidates);
  const [selectedListingId, setSelectedListingId] = React.useState(
    data.candidates.find((candidate) => !candidate.pinId)?.listing.id ?? ""
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [addEditor, setAddEditor] = React.useState<PinEditorState>({
    sortOrder: nextSortOrder(data.pins),
    status: "active",
    startsAt: "",
    endsAt: "",
  });
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [isSearching, startSearchTransition] = React.useTransition();
  const [isSaving, startSaveTransition] = React.useTransition();

  const pinnedListingIds = React.useMemo(
    () => new Set(pins.map((pin) => pin.listingId)),
    [pins]
  );

  const stats = React.useMemo(() => {
    const live = pins.filter((pin) => pin.visibility === "live").length;
    const paused = pins.filter((pin) => pin.visibility === "paused").length;
    const scheduled = pins.filter((pin) => pin.visibility === "scheduled").length;
    const expired = pins.filter((pin) => pin.visibility === "expired").length;

    return {
      total: pins.length,
      live,
      paused,
      scheduled,
      expired,
    };
  }, [pins]);

  const selectedCandidate = candidates.find(
    (candidate) => candidate.listing.id === selectedListingId
  );

  const replacePin = (nextPin: FeaturedListingPin) => {
    setPins((current) =>
      current
        .some((pin) => pin.id === nextPin.id)
        ? current.map((pin) => (pin.id === nextPin.id ? nextPin : pin))
        : [...current, nextPin]
    );
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.listing.id === nextPin.listingId
          ? { ...candidate, pinId: nextPin.id }
          : candidate
      )
    );
    router.refresh();
  };

  const handlePinSaved = (pin: FeaturedListingPin, message: string) => {
    replacePin(pin);
    setFeedback({ status: "success", message });
  };

  const handlePinDeleted = (pinId: string, message: string) => {
    const deletedPin = pins.find((pin) => pin.id === pinId);
    setPins((current) => current.filter((pin) => pin.id !== pinId));
    if (deletedPin) {
      setCandidates((current) =>
        current.map((candidate) =>
          candidate.listing.id === deletedPin.listingId
            ? { ...candidate, pinId: null }
            : candidate
        )
      );
    }
    setFeedback({ status: "success", message });
    router.refresh();
  };

  const handleSearch = () => {
    startSearchTransition(async () => {
      const result = await searchFeaturedListingPinCandidates(searchQuery);
      if (result.success) {
        setCandidates(result.candidates);
        setFeedback(null);
      } else {
        setFeedback({ status: "error", message: result.error });
      }
    });
  };

  const handleAddPin = () => {
    if (!data.schemaReady) {
      setFeedback({
        status: "error",
        message: "Apply the featured listing pins migration before saving homepage rail changes.",
      });
      return;
    }

    if (!selectedCandidate) {
      setFeedback({ status: "error", message: "Select a listing to pin." });
      return;
    }

    startSaveTransition(async () => {
      const result = await saveFeaturedListingPin({
        listingId: selectedCandidate.listing.id,
        status: addEditor.status,
        sortOrder: Number(addEditor.sortOrder || 0),
        startsAt: fromDateTimeLocalValue(addEditor.startsAt),
        endsAt: fromDateTimeLocalValue(addEditor.endsAt),
      });

      if (result.success) {
        replacePin(result.pin);
        setAddEditor({
          sortOrder: nextSortOrder([...pins, result.pin]),
          status: "active",
          startsAt: "",
          endsAt: "",
        });
        setFeedback({ status: "success", message: result.message });
      } else {
        setFeedback({ status: "error", message: result.error });
      }
    });
  };

  const sortedPins = React.useMemo(
    () =>
      pins
        .slice()
        .sort((left, right) =>
          left.sortOrder === right.sortOrder
            ? new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
            : left.sortOrder - right.sortOrder
        ),
    [pins]
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Featured Listings" />

      {!data.schemaReady ? (
        <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[13px] leading-6 text-[#9a3412]">
          Apply the featured listing pins migration before saving homepage rail changes.
        </div>
      ) : null}

      {data.error ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] leading-6 text-[#991b1b]">
          Featured listings could not be loaded: {data.error}
        </div>
      ) : null}

      {feedback ? (
        <div
          className={cn(
            "rounded-[16px] border px-5 py-4 text-[13px] leading-6",
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
          label="Pinned listings"
          value={stats.total.toLocaleString("en-KE")}
          icon={<Pin className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Live now"
          value={stats.live.toLocaleString("en-KE")}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Scheduled"
          value={stats.scheduled.toLocaleString("en-KE")}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Paused or expired"
          value={(stats.paused + stats.expired).toLocaleString("en-KE")}
          icon={<PauseCircle className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        data-tour="featured-add"
        title="Add listing"
        description="Search active inventory and pin one listing into the homepage featured rail."
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div>
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-3">
                <Search className="h-4 w-4 shrink-0 text-[#9ca3af]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                  placeholder="Search make, model, body, description..."
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                />
              </label>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className={adminGhostButtonClass}
              >
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {candidates.length > 0 ? (
                candidates.map((candidate) => {
                  const isPinned = pinnedListingIds.has(candidate.listing.id);
                  const isSelected = selectedListingId === candidate.listing.id;

                  return (
                    <button
                      key={candidate.listing.id}
                      type="button"
                      onClick={() => setSelectedListingId(candidate.listing.id)}
                      className={cn(
                        "rounded-[14px] border bg-white p-3 text-left transition",
                        isSelected
                          ? "border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.10)]"
                          : "border-[#e5e7eb] hover:border-[#bfdbfe]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <ListingSummary listing={candidate.listing} compact />
                        {isPinned ? (
                          <span className="shrink-0 rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1d4ed8]">
                            Pinned
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[14px] border border-dashed border-[#d1d5db] bg-[#f8fafc] px-4 py-8 text-center text-[13px] text-[#6b7280] lg:col-span-2">
                  No active listings found for this search.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <div className="mb-4 flex items-center gap-2">
              <CarFront className="h-4 w-4 text-[#2563eb]" />
              <h3 className="text-[14px] font-semibold text-[#111827]">Selected listing</h3>
            </div>

            {selectedCandidate ? (
              <ListingSummary listing={selectedCandidate.listing} />
            ) : (
              <p className="text-[13px] text-[#6b7280]">Select a listing from the search results.</p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-[12px] font-medium text-[#374151]">
                  Sort order
                </span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={addEditor.sortOrder}
                  onChange={(event) =>
                    setAddEditor((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  className={adminInputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-[12px] font-medium text-[#374151]">
                  Status
                </span>
                <select
                  value={addEditor.status}
                  onChange={(event) =>
                    setAddEditor((current) => ({
                      ...current,
                      status: event.target.value as FeaturedListingPinStatus,
                    }))
                  }
                  className={adminSelectClass}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[12px] font-medium text-[#374151]">
                  Starts
                </span>
                <input
                  type="datetime-local"
                  value={addEditor.startsAt}
                  onChange={(event) =>
                    setAddEditor((current) => ({ ...current, startsAt: event.target.value }))
                  }
                  className={adminInputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-[12px] font-medium text-[#374151]">
                  Ends
                </span>
                <input
                  type="datetime-local"
                  value={addEditor.endsAt}
                  onChange={(event) =>
                    setAddEditor((current) => ({ ...current, endsAt: event.target.value }))
                  }
                  className={adminInputClass}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddPin}
              disabled={
                !data.schemaReady ||
                !selectedCandidate ||
                pinnedListingIds.has(selectedCandidate.listing.id) ||
                isSaving
              }
              className={cn(adminPrimaryButtonClass, "mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50")}
            >
              <Pin className="mr-2 h-4 w-4" />
              {isSaving ? "Pinning..." : "Pin listing"}
            </button>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        data-tour="featured-rail"
        title="Pinned rail"
        description="Listings appear in ascending sort order when active and inside their date window."
        action={
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#6b7280]">
            <ListOrdered className="h-4 w-4 text-[#2563eb]" />
            {sortedPins.length.toLocaleString("en-KE")} pinned
          </div>
        }
      >
        {sortedPins.length > 0 ? (
          <div className="space-y-3">
            {sortedPins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                disabled={!data.schemaReady}
                onSaved={handlePinSaved}
                onError={(message) => setFeedback({ status: "error", message })}
                onDeleted={handlePinDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#d1d5db] bg-[#f8fafc] px-4 py-10 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-[#9ca3af]" />
            <p className="mt-3 text-[14px] font-semibold text-[#111827]">No pinned listings</p>
            <p className="mt-1 text-[13px] text-[#6b7280]">
              Search for an active listing and pin it to fill this rail.
            </p>
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}
