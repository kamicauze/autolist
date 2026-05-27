"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Archive,
  BadgeCheck,
  CalendarDays,
  CarFront,
  ChevronDown,
  Clock3,
  Copy,
  DollarSign,
  Eye,
  Gauge,
  Pencil,
  Rocket,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteListing,
  duplicateOwnerListing,
  submitListingForReview,
  updateOwnerListingStatus,
} from "@/lib/actions/listings";
import {
  acceptListingOffer,
  counterListingOffer,
  createListingOffer,
  rejectListingOffer,
  withdrawListingOffer,
} from "@/lib/actions/offers";
import { LISTING_STATUS_META } from "@/lib/constants/marketplace";
import { getImageUrl } from "@/lib/utils/listings";
import type { Listing } from "@/lib/types/listing";
import { getListingDisplayTitle, getListingSubtitle } from "@/lib/utils/vehicle-display";
import { cn } from "@/lib/utils";
import {
  SellerStatusPill,
  formatDashboardCurrency,
  formatDashboardDate,
} from "../seller-dashboard-ui";

type ListingTab = "all" | "received-offers" | "available-bids" | "your-bids";

type OfferRow = {
  id: string;
  listingId?: string | null;
  listingTitle?: string | null;
  buyerName?: string | null;
  amount?: number | null;
  status?: string | null;
  createdAt?: string | null;
  year?: number | null;
  mileage?: number | null;
  condition?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  claimedBy?: string | null;
  canMakeOffer?: boolean;
  canWithdraw?: boolean;
  canAccept?: boolean;
  canReject?: boolean;
  canCounter?: boolean;
};

interface MyListingsProps {
  listings: Listing[];
  availableBids?: OfferRow[];
  yourBids?: OfferRow[];
  receivedOffers?: OfferRow[];
  offersLoading?: boolean;
}

const tabs: Array<{ value: ListingTab; label: string }> = [
  { value: "all", label: "All listing" },
  { value: "available-bids", label: "Available bids" },
];

const listingStatusOptions = ["all", ...Object.keys(LISTING_STATUS_META)] as const;

function offerTone(status?: string | null) {
  const normalized = status?.toLowerCase();
  if (normalized === "accepted") return "green" as const;
  if (normalized === "pending" || normalized === "open") return "amber" as const;
  if (normalized === "countered") return "blue" as const;
  if (normalized === "rejected" || normalized === "withdrawn" || normalized === "declined" || normalized === "expired") return "red" as const;
  return "neutral" as const;
}

function normalizeStatusLabel(value: string) {
  if (value === "all") return "All status";
  return LISTING_STATUS_META[value as keyof typeof LISTING_STATUS_META]?.label ?? value.replace(/_/g, " ");
}

function getListingImageUrl(listing: Listing) {
  const image = [...(listing.images ?? [])].sort((a, b) => a.image_order - b.image_order)[0];
  return image ? getImageUrl(image.r2_key, "card") : "/placeholder-car.jpg";
}

function formatListingPrice(listing: Listing) {
  const formatted = formatDashboardCurrency(listing.price);
  return listing.currency?.toUpperCase() === "KES" ? formatted.replace(/^KES\s*/i, "Ksh") : formatted;
}

function getFigmaListingStatus(status: Listing["status"]) {
  switch (status) {
    case "active":
      return {
        label: "Approved",
        className: "border-[rgba(126,211,33,0.14)] bg-[rgba(126,211,33,0.1)] text-[#7ed321]",
      };
    case "pending":
      return {
        label: "Pending",
        className: "border-[#ffd2cf] bg-[#fff1f0] text-[#f04438]",
      };
    case "sold":
      return {
        label: "Sold",
        className: "border-[#ddd6fe] bg-[#ede9fe] text-[#7c3aed]",
      };
    case "reserved":
      return {
        label: "Reserved",
        className: "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]",
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]",
      };
    case "expired":
      return {
        label: "Expired",
        className: "border-[#e5e7eb] bg-[#f3f4f6] text-[#4b5563]",
      };
    case "draft":
    default:
      return {
        label: LISTING_STATUS_META[status]?.label ?? "Draft",
        className: "border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563]",
      };
  }
}

function isWithinDateRange(value: string, fromDate: string, toDate: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;

  if (fromDate) {
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    if (timestamp < from) return false;
  }

  if (toDate) {
    const to = new Date(`${toDate}T23:59:59`).getTime();
    if (timestamp > to) return false;
  }

  return true;
}

function FigmaListingStatusPill({ status }: { status: Listing["status"] }) {
  const meta = getFigmaListingStatus(status);

  return (
    <span
      className={cn(
        "inline-flex h-[28px] min-w-[76px] items-center justify-center rounded-full border px-2 text-[12px] font-medium leading-none",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

function ListingViewTabs({
  activeTab,
  onSelectTab,
  showAvailableBids,
}: {
  activeTab: ListingTab;
  onSelectTab: (tab: ListingTab) => void;
  showAvailableBids: boolean;
}) {
  const visibleTabs = showAvailableBids
    ? tabs
    : tabs.filter((tab) => tab.value !== "available-bids");

  return (
    <div className="flex items-center gap-[13px]">
      {visibleTabs.map((tab) => {
        const active = tab.value === activeTab;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelectTab(tab.value)}
            className={cn(
              "inline-flex h-[45px] items-center justify-center rounded-[10px] px-[18px] text-[16px] font-medium leading-6 transition",
              active
                ? "bg-[#2563eb] text-white shadow-[0_10px_15px_rgba(37,99,235,0.3),0_4px_6px_rgba(37,99,235,0.3)]"
                : "border border-[#e5e7eb] bg-white text-[#364153] hover:border-[#cbd5e1]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectionActionButton({
  icon,
  label,
  tone,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "danger" | "purple" | "amber" | "neutral";
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneClass = {
    danger: "bg-[#ef4444]",
    purple: "bg-[#8b5cf6]",
    amber: "bg-[#f59e0b]",
    neutral: "bg-transparent text-white",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-w-[64px] flex-col items-center gap-1 rounded-[12px] py-2 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", toneClass)}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-6">
      <div className="rounded-[8px] border border-dashed border-[#d8d8d8] bg-[#fafafa] px-6 py-14 text-center">
        <p className="font-heading text-[24px] font-semibold text-[#202224]">{title}</p>
        <p className="mx-auto mt-2 max-w-xl text-[14px] leading-6 text-[#7d7d7d]">{description}</p>
      </div>
    </div>
  );
}

function ListingRowActions({
  listing,
  onDelete,
  onDuplicate,
  onGoLive,
  onHold,
  isDeleting,
  isPending,
}: {
  listing: Listing;
  onDelete: (listing: Listing) => void;
  onDuplicate: (listing: Listing) => void;
  onGoLive: (listing: Listing) => void;
  onHold: (listing: Listing) => void;
  isDeleting: boolean;
  isPending: boolean;
}) {
  const canGoLive = listing.status === "draft" || listing.status === "rejected" || listing.status === "expired";
  const holdLabel = listing.status === "reserved" ? "Resume listing" : "Suspend/Hold";
  const itemClass =
    "flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13px] font-medium text-[#374151] outline-none hover:bg-[#f4f7fb] focus:bg-[#f4f7fb] data-[disabled]:pointer-events-none data-[disabled]:opacity-60 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-[40px] w-[104px] cursor-pointer items-center justify-center gap-1 rounded-[8px] border border-[#2563eb] bg-white text-[13px] font-medium text-[#2563eb] transition hover:bg-[#eff6ff]"
        >
          Actions
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-[100] w-[190px] rounded-[8px] border border-[#ededed] bg-white p-1 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
        >
        {canGoLive ? (
          <DropdownMenu.Item
            onSelect={() => onGoLive(listing)}
            disabled={isPending}
            className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13px] font-medium text-[#2563eb] outline-none hover:bg-[#eff6ff] focus:bg-[#eff6ff] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
          >
            <Rocket className="h-4 w-4" />
            Submit for review
          </DropdownMenu.Item>
        ) : null}
        <DropdownMenu.Item asChild>
          <Link href={`/vehicle/${listing.id}`} className={itemClass}>
            <Eye className="h-4 w-4" />
            View listing
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href={`/dashboard/listings/${listing.id}/edit`} className={itemClass}>
            <Pencil className="h-4 w-4" />
            Edit listing
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => onHold(listing)}
          disabled={isPending}
          className={itemClass}
        >
          <Clock3 className="h-4 w-4" />
          {holdLabel}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => onDuplicate(listing)}
          disabled={isPending}
          className={itemClass}
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => onDelete(listing)}
          disabled={isDeleting}
          className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13px] font-medium text-[#dc2626] outline-none hover:bg-[#fff1f1] focus:bg-[#fff1f1] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function BidsPlaceholder({
  rows,
  loading,
  mode,
  onSelectTab,
}: {
  rows?: OfferRow[];
  loading?: boolean;
  mode: "available" | "mine" | "received";
  onSelectTab?: (tab: ListingTab) => void;
}) {
  const router = useRouter();
  const [pendingActionId, setPendingActionId] = React.useState<string | null>(null);

  const handleMakeOffer = async (row: OfferRow) => {
    if (!row.listingId) return;

    const amountInput = window.prompt(
      "Enter your offer amount",
      row.amount ? String(Math.round(row.amount)) : ""
    );
    if (!amountInput) return;

    const amount = Number(amountInput.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Enter a valid offer amount.");
      return;
    }

    const message = window.prompt("Add a short message for the seller", "") || "";
    setPendingActionId(row.id);
    const result = await createListingOffer({
      listingId: row.listingId,
      amount,
      message,
    });
    setPendingActionId(null);

    if ("error" in result) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  };

  const handleWithdrawOffer = async (row: OfferRow) => {
    const confirmed = window.confirm("Withdraw this offer?");
    if (!confirmed) return;

    setPendingActionId(row.id);
    const result = await withdrawListingOffer(row.id);
    setPendingActionId(null);

    if ("error" in result) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  };

  const handleAcceptOffer = async (row: OfferRow) => {
    const confirmed = window.confirm("Accept this offer? This will reserve the listing and reject competing live offers.");
    if (!confirmed) return;

    setPendingActionId(row.id);
    const result = await acceptListingOffer(row.id);
    setPendingActionId(null);

    if ("error" in result) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  };

  const handleRejectOffer = async (row: OfferRow) => {
    const message = window.prompt("Optional note for the dealer", "") || "";

    setPendingActionId(row.id);
    const result = await rejectListingOffer(row.id, message);
    setPendingActionId(null);

    if ("error" in result) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  };

  const handleCounterOffer = async (row: OfferRow) => {
    const amountInput = window.prompt(
      "Enter your counter amount",
      row.amount ? String(Math.round(row.amount)) : ""
    );
    if (!amountInput) return;

    const amount = Number(amountInput.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Enter a valid counter amount.");
      return;
    }

    const message = window.prompt("Add a short note for the dealer", "") || "";

    setPendingActionId(row.id);
    const result = await counterListingOffer({
      offerId: row.id,
      amount,
      message,
    });
    setPendingActionId(null);

    if ("error" in result) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  };

  if (loading) {
    return (
      <div className="space-y-3 px-5 py-5">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-[8px] bg-[#f1f5f9]" />
        ))}
      </div>
    );
  }

  if (mode === "available") {
    const bidRows = rows ?? [];
    const availableCount = bidRows.filter((row) => row.canMakeOffer).length;
    const claimedCount = bidRows.length - availableCount;

    return (
      <div className="space-y-8 px-0 pb-8">
        <div className="flex flex-col gap-4 px-0 pt-1 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-[13px]">
            <button
              type="button"
              onClick={() => onSelectTab?.("all")}
              className="h-[45px] rounded-[10px] border border-[#e5e7eb] bg-white px-4 text-[16px] font-medium text-[#364153]"
            >
              All listing
            </button>
            <button
              type="button"
              onClick={() => onSelectTab?.("available-bids")}
              className="h-[45px] rounded-[10px] bg-[#155dfc] px-[21px] text-[16px] font-medium text-white shadow-[0_10px_15px_rgba(21,93,252,0.3),0_4px_6px_rgba(21,93,252,0.3)]"
            >
              Available bids
            </button>
          </div>

          <div className="flex min-h-[47px] flex-wrap items-center gap-5 rounded-[12px] border border-[#e5e7eb] bg-white px-5 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]">
            <span className="text-[14px] font-medium text-[#4a5565]">Filter by Status:</span>
            <label className="flex items-center gap-2 text-[14px] font-medium text-[#101828]">
              <input type="checkbox" checked readOnly className="h-[18px] w-[18px] accent-[#2563eb]" />
              Available
              <span className="rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[12px] font-medium text-[#008236]">
                {availableCount}
              </span>
            </label>
            <label className="flex items-center gap-2 text-[14px] font-medium text-[#101828]">
              <input type="checkbox" checked readOnly className="h-[18px] w-[18px] accent-[#2563eb]" />
              Claimed
              <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[12px] font-medium text-[#c10007]">
                {claimedCount}
              </span>
            </label>
          </div>
        </div>

        {bidRows.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#d1d5db] bg-[#f9fafb] px-6 py-16 text-center">
            <p className="text-[22px] font-bold text-[#101828]">No available bids yet</p>
            <p className="mx-auto mt-2 max-w-xl text-[14px] leading-6 text-[#4a5565]">
              Dealer bid opportunities will appear here as cards when seller listings are open for offers.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
          {bidRows.map((offer) => {
            const isAvailable = Boolean(offer.canMakeOffer);
            const statusLabel = isAvailable
              ? "Available for Bidding"
              : `Claimed by ${offer.claimedBy || offer.buyerName || "Premium Auto Dealers"}`;

            return (
              <article
                key={offer.id}
                className="rounded-[12px] border border-[#e5e7eb] bg-white px-[18px] py-[23px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[10px] bg-[#155dfc] text-white">
                        <CarFront className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-sans text-[22px] font-bold leading-[33px] text-[#101828]">
                          {offer.listingTitle || "2019 Honda Accord"}
                        </h3>
                        <p className="text-[14px] leading-[21px] text-[#4a5565]">
                          Submitted by {offer.buyerName || "Sarah Johnson"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex h-[38px] items-center gap-2 rounded-full border px-4 text-[14px] font-medium",
                        isAvailable
                          ? "border-[#b9f8cf] bg-[#f0fdf4] text-[#008236]"
                          : "border-[#ffc9c9] bg-[#fef2f2] text-[#c10007]"
                      )}
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <BidMetric
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Year"
                      value={offer.year ? String(offer.year) : "2019"}
                    />
                    <BidMetric
                      icon={<Gauge className="h-4 w-4" />}
                      label="Mileage"
                      value={offer.mileage ? `${offer.mileage.toLocaleString()} mi` : "48,000 mi"}
                    />
                    <BidMetric
                      icon={<Settings2 className="h-4 w-4" />}
                      label="Condition"
                      value={offer.condition || "Good"}
                    />
                    <BidMetric
                      highlight
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Asking Price"
                      value={offer.amount ? formatDashboardCurrency(offer.amount) : "Kes1,950,000"}
                    />
                  </div>

                  <p className="text-[14px] leading-[22.75px] text-[#364153]">
                    {offer.description || "Clean title, no accidents, new tires recently installed."}
                  </p>

                  <div className="flex flex-col gap-4 border-t border-[#e5e7eb] pt-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-[12px] font-medium leading-[18px] text-[#6a7282]">
                        Contact Information
                      </p>
                      <p className="text-[14px] leading-[21px] text-[#101828]">
                        {offer.contactEmail || "sarah.j@email.com"} • {offer.contactPhone || "(+254) 7555 987-6543"}
                      </p>
                      <p className="text-[12px] leading-[18px] text-[#6a7282]">
                        Submitted on {offer.createdAt ? formatDashboardDate(offer.createdAt) : "March 14, 2026"}
                      </p>
                    </div>

                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => handleMakeOffer(offer)}
                        disabled={pendingActionId === offer.id}
                        className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-[#155dfc] px-8 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingActionId === offer.id ? "Saving..." : "Make an Offer"}
                      </button>
                    ) : (
                      <span className="inline-flex h-[46px] items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-[#f3f4f6] px-8 text-[14px] font-medium text-[#4a5565]">
                        Already Claimed
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        )}
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <EmptyState
        title={mode === "received" ? "No offers received yet" : "No bids from you yet"}
        description={
          mode === "received"
            ? "Dealer offers on your listings will appear here once buyers from approved dealerships submit them."
            : "Offer activity will appear here once there is data for this account."
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full border-collapse">
        <thead>
          <tr className="border-b border-[#ededed] bg-[#fafafa] text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a8a8a]">
            <th className="px-5 py-3">Listing</th>
            <th className="px-5 py-3">{mode === "received" ? "Dealer" : "Buyer"}</th>
            <th className="px-5 py-3">Offer</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Received</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0f0]">
          {rows.map((offer) => (
            <tr key={offer.id} className="text-[14px] text-[#202224]">
              <td className="px-5 py-4 font-semibold">{offer.listingTitle || "Listing offer"}</td>
              <td className="px-5 py-4 text-[#5f6673]">{offer.buyerName || "Buyer"}</td>
              <td className="px-5 py-4 font-semibold">
                {offer.amount ? formatDashboardCurrency(offer.amount) : "Amount pending"}
              </td>
              <td className="px-5 py-4">
                <SellerStatusPill label={offer.status || "Pending"} tone={offerTone(offer.status)} />
              </td>
              <td className="px-5 py-4 text-[#5f6673]">
                {offer.createdAt ? formatDashboardDate(offer.createdAt) : "Not available"}
              </td>
              <td className="px-5 py-4 text-right">
                {offer.canMakeOffer ? (
                  <button
                    type="button"
                    onClick={() => handleMakeOffer(offer)}
                    disabled={pendingActionId === offer.id}
                    className="inline-flex h-9 items-center justify-center rounded-[6px] bg-[#2563eb] px-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingActionId === offer.id ? "Saving..." : "Make offer"}
                  </button>
                ) : offer.canWithdraw ? (
                  <button
                    type="button"
                    onClick={() => handleWithdrawOffer(offer)}
                    disabled={pendingActionId === offer.id}
                    className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#fecaca] bg-white px-3 text-[13px] font-semibold text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingActionId === offer.id ? "Saving..." : "Withdraw"}
                  </button>
                ) : offer.canAccept || offer.canReject || offer.canCounter ? (
                  <div className="flex justify-end gap-2">
                    {offer.canAccept ? (
                      <button
                        type="button"
                        onClick={() => handleAcceptOffer(offer)}
                        disabled={pendingActionId === offer.id}
                        className="inline-flex h-9 items-center justify-center rounded-[6px] bg-[#16a34a] px-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Accept
                      </button>
                    ) : null}
                    {offer.canCounter ? (
                      <button
                        type="button"
                        onClick={() => handleCounterOffer(offer)}
                        disabled={pendingActionId === offer.id}
                        className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#bfdbfe] bg-white px-3 text-[13px] font-semibold text-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Counter
                      </button>
                    ) : null}
                    {offer.canReject ? (
                      <button
                        type="button"
                        onClick={() => handleRejectOffer(offer)}
                        disabled={pendingActionId === offer.id}
                        className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#fecaca] bg-white px-3 text-[13px] font-semibold text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-[13px] text-[#9ca3af]">No action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BidMetric({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-[82px] rounded-[10px] border px-5 py-4",
        highlight
          ? "border-[#bedbff] bg-[linear-gradient(160deg,#eff6ff_0%,#dbeafe_100%)]"
          : "border-[#f3f4f6] bg-[#f9fafb]"
      )}
    >
      <div className={cn("flex items-center gap-2 text-[12px]", highlight ? "text-[#1447e6]" : "text-[#4a5565]")}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className={cn("mt-2 text-[18px] font-bold leading-[27px]", highlight ? "text-[#1c398e]" : "text-[#101828]")}>
        {value}
      </p>
    </div>
  );
}

export function MyListings({
  listings,
  availableBids,
  offersLoading = false,
}: MyListingsProps) {
  const router = useRouter();
  const [listingItems, setListingItems] = React.useState(listings);
  const [activeTab, setActiveTab] = React.useState<ListingTab>(() =>
    availableBids?.length ? "available-bids" : "all"
  );
  const showAvailableBids = Boolean(availableBids?.length);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof listingStatusOptions)[number]>("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deletingIds, setDeletingIds] = React.useState<string[]>([]);
  const [pendingIds, setPendingIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setListingItems(listings);
    setSelectedIds((current) => current.filter((id) => listings.some((listing) => listing.id === id)));
  }, [listings]);

  const filteredListings = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listingItems.filter((listing) => {
      const title = getListingDisplayTitle(listing).toLowerCase();
      const subtitle = getListingSubtitle(listing).toLowerCase();
      const location = (listing.dealer?.city || "").toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        subtitle.includes(normalizedQuery) ||
        location.includes(normalizedQuery);
      const matchesStatus = status === "all" || listing.status === status;
      const matchesDate = isWithinDateRange(listing.created_at, fromDate, toDate);

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [fromDate, listingItems, query, status, toDate]);

  const displayListings = React.useMemo(() => {
    const direction = sortOrder === "newest" ? -1 : 1;

    return [...filteredListings].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return (aTime - bTime) * direction;
    });
  }, [filteredListings, sortOrder]);

  const visibleIds = displayListings.map((listing) => listing.id);
  const selectedVisibleIds = selectedIds.filter((id) => visibleIds.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleIds.length === visibleIds.length;

  const toggleListingSelection = (listingId: string) => {
    setSelectedIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId]
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const handleDeleteListing = (listing: Listing) => {
    const title = getListingDisplayTitle(listing);
    const confirmed = window.confirm(`Delete "${title}"? This will remove it from seller and public views.`);
    if (!confirmed) return;

    setDeletingIds((current) => [...current, listing.id]);
    void deleteListing(listing.id).then((result) => {
      setDeletingIds((current) => current.filter((id) => id !== listing.id));
      if (result.error) {
        window.alert(result.error);
        return;
      }

      setListingItems((current) => current.filter((item) => item.id !== listing.id));
      setSelectedIds((current) => current.filter((id) => id !== listing.id));
      router.refresh();
    });
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected listing(s)?`);
    if (!confirmed) return;

    const idsToDelete = [...selectedIds];
    setDeletingIds((current) => Array.from(new Set([...current, ...idsToDelete])));

    for (const id of idsToDelete) {
      const result = await deleteListing(id);
      if (result.error) {
        window.alert(result.error);
        break;
      }

      setListingItems((current) => current.filter((item) => item.id !== id));
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    }

    setDeletingIds((current) => current.filter((id) => !idsToDelete.includes(id)));
    router.refresh();
  };

  const handleBulkArchive = async () => {
    const confirmed = window.confirm(`Archive ${selectedIds.length} selected listing(s)?`);
    if (!confirmed) return;

    const idsToArchive = [...selectedIds];
    setPendingIds((current) => Array.from(new Set([...current, ...idsToArchive])));

    for (const id of idsToArchive) {
      const result = await updateOwnerListingStatus(id, "reserved");
      if (result.error) {
        window.alert(result.error);
        break;
      }
    }

    setPendingIds((current) => current.filter((id) => !idsToArchive.includes(id)));
    setSelectedIds([]);
    router.refresh();
  };

  const runListingAction = async (
    listing: Listing,
    action: () => Promise<{ error?: string; success?: boolean }>
  ) => {
    setPendingIds((current) => [...current, listing.id]);
    const result = await action();
    setPendingIds((current) => current.filter((id) => id !== listing.id));

    if (result.error) {
      window.alert(result.error);
      return false;
    }

    router.refresh();
    return true;
  };

  const handleGoLive = (listing: Listing) => {
    void runListingAction(listing, () => submitListingForReview(listing.id));
  };

  const handleDuplicate = (listing: Listing) => {
    void runListingAction(listing, async () => {
      const result = await duplicateOwnerListing(listing.id);
      if (!("error" in result)) {
        router.push(`/dashboard/listings/${result.id}/edit`);
      }
      return result;
    });
  };

  const handleBulkDuplicate = () => {
    const listing = listingItems.find((item) => item.id === selectedIds[0]);
    if (!listing) return;
    handleDuplicate(listing);
  };

  const handleHold = (listing: Listing) => {
    const nextStatus = listing.status === "reserved" ? "draft" : "reserved";
    void runListingAction(listing, () => updateOwnerListingStatus(listing.id, nextStatus));
  };

  return (
    <div className="space-y-[30px]">
      <h1 className="font-heading text-[34px] font-semibold leading-none text-[#111827]">
        {activeTab === "available-bids" ? "All listings" : "All listing"}
      </h1>

      {activeTab === "available-bids" ? (
        <BidsPlaceholder
          rows={availableBids}
          loading={offersLoading}
          mode="available"
          onSelectTab={setActiveTab}
        />
      ) : (
        <>
          <ListingViewTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            showAvailableBids={showAvailableBids}
          />

          <section className="rounded-[20px] border border-[#ededed] bg-white px-[22px] py-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.02)] xl:px-[30px] xl:py-[30px]">
            <div className="grid gap-[10px] lg:grid-cols-[1.05fr_1fr_1fr_1fr]">
              <label className="flex h-[54px] min-w-0 items-center gap-3 rounded-[8px] border border-[#ededed] bg-white px-4">
                <Search className="h-4 w-4 shrink-0 text-[#9a9aa5]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search..."
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#24272c] outline-none placeholder:text-[#696665]"
                />
              </label>

              <label className="relative flex h-[54px] min-w-0 items-center rounded-[8px] border border-[#ededed] bg-white px-4">
                {!fromDate ? (
                  <span className="pointer-events-none absolute left-4 text-[14px] text-[#696665]">
                    From date
                  </span>
                ) : null}
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  aria-label="From date"
                  className={cn(
                    "h-full min-w-0 flex-1 border-0 bg-transparent pr-8 text-[14px] text-[#24272c] outline-none",
                    !fromDate && "text-transparent focus:text-[#24272c]"
                  )}
                />
                <CalendarDays className="pointer-events-none absolute right-4 h-4 w-4 text-[#9a9aa5]" />
              </label>

              <label className="relative flex h-[54px] min-w-0 items-center rounded-[8px] border border-[#ededed] bg-white px-4">
                {!toDate ? (
                  <span className="pointer-events-none absolute left-4 text-[14px] text-[#696665]">
                    To date
                  </span>
                ) : null}
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  aria-label="To date"
                  className={cn(
                    "h-full min-w-0 flex-1 border-0 bg-transparent pr-8 text-[14px] text-[#24272c] outline-none",
                    !toDate && "text-transparent focus:text-[#24272c]"
                  )}
                />
                <CalendarDays className="pointer-events-none absolute right-4 h-4 w-4 text-[#9a9aa5]" />
              </label>

              <label className="relative flex h-[54px] min-w-0 items-center rounded-[8px] border border-[#ededed] bg-white px-4">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as typeof status)}
                  aria-label="Status"
                  className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent pr-8 text-[14px] text-[#24272c] outline-none"
                >
                  {listingStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "Status" : normalizeStatusLabel(option)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-[#24272c]" />
              </label>
            </div>

            <div className="mt-[21px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] font-medium text-[#2563eb]">
                {displayListings.length} results found
              </p>

              <label className="flex items-center gap-1 self-start text-[12px] text-[#696665] sm:self-auto">
                <span>Sort By</span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
                  className="appearance-none border-0 bg-transparent pr-5 text-[12px] font-medium text-[#24272c] outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <ChevronDown className="-ml-5 h-3.5 w-3.5 text-[#24272c]" />
              </label>
            </div>

            <div className="relative mt-[11px] overflow-x-auto pb-2">
              {selectedIds.length > 0 ? (
                <div className="absolute left-[18px] top-[300px] z-30 flex min-h-[96px] w-[min(640px,calc(100vw-96px))] flex-wrap items-center gap-4 rounded-[20px] border border-[rgba(255,255,255,0.1)] bg-[#24272c] px-5 py-4 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
                  <div className="flex h-12 items-center gap-3 border-r border-[rgba(255,255,255,0.2)] pr-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-[18px] font-bold text-white">
                      {selectedIds.length}
                    </span>
                    <span>
                      <span className="block text-[16px] font-medium leading-6 text-white">Items selected</span>
                      <span className="block text-[12px] leading-[18px] text-[rgba(255,255,255,0.6)]">
                        Choose an action
                      </span>
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <SelectionActionButton
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Delete"
                      tone="danger"
                      onClick={handleBulkDelete}
                      disabled={deletingIds.length > 0}
                    />
                    <SelectionActionButton
                      icon={<Archive className="h-4 w-4" />}
                      label="Archive"
                      tone="purple"
                      onClick={handleBulkArchive}
                      disabled={pendingIds.length > 0}
                    />
                    <SelectionActionButton
                      icon={<Copy className="h-4 w-4" />}
                      label="Duplicate"
                      tone="amber"
                      onClick={handleBulkDuplicate}
                      disabled={pendingIds.length > 0}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="ml-5 flex h-10 w-10 items-center justify-center border-l border-[rgba(255,255,255,0.2)] pl-5 text-white/70 transition hover:text-white"
                      aria-label="Clear selected listings"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : null}

              <table className="w-full min-w-[780px] table-fixed border-separate border-spacing-0">
                <colgroup>
                  <col className="w-[36px]" />
                  <col className="w-[38%]" />
                  <col className="w-[92px]" />
                  <col className="w-[108px]" />
                  <col className="w-[116px]" />
                </colgroup>
                <thead>
                  <tr className="h-[34px] bg-[#24272c] text-left text-[12px] font-medium text-white">
                    <th className="rounded-l-[5px] px-2">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleVisibleSelection}
                        aria-label="Select all listings"
                        className="h-4 w-4 rounded-[2px] border-[#9a9aa5] accent-[#2563eb]"
                      />
                    </th>
                    <th className="px-0">Listing</th>
                    <th className="border-l border-[#3a3d43] px-2">Status</th>
                    <th className="border-l border-[#3a3d43] px-2">Posting date</th>
                    <th className="rounded-r-[5px] border-l border-[#3a3d43] px-0 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayListings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border-b border-[#ededed] py-16 text-center text-[14px] text-[#696665]">
                        No owned listings match the current filter.
                      </td>
                    </tr>
                  ) : (
                    displayListings.map((listing) => {
                      const title = getListingDisplayTitle(listing);
                      const subtitle = getListingSubtitle(listing) || `${listing.year} ${listing.make} ${listing.model}`;
                      const selected = selectedIds.includes(listing.id);

                      return (
                        <tr key={listing.id} className={cn("h-[96px]", selected ? "bg-[#fbfdff]" : "bg-white")}>
                          <td className="border-b border-[#ededed] px-2 align-top pt-[35px]">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleListingSelection(listing.id)}
                              aria-label={`Select ${title}`}
                              className="h-4 w-4 rounded-[2px] border-[#9a9aa5] accent-[#2563eb]"
                            />
                          </td>
                          <td className="border-b border-[#ededed] py-3 pr-3 align-top">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="relative h-[68px] w-[112px] shrink-0 overflow-hidden rounded-[8px] bg-[#d9d9d9]">
                                <Image
                                  src={getListingImageUrl(listing)}
                                  alt={title}
                                  fill
                                  className="object-cover"
                                  sizes="112px"
                                />
                              </div>
                              <div className="min-w-0 pt-0">
                                <p className="truncate font-heading text-[15px] font-medium leading-[1.25] text-[#24272c]">
                                  {title}
                                </p>
                                <p className="mt-1 truncate text-[11px] leading-[1.35] text-[#696665]">
                                  {subtitle}
                                </p>
                                <p className="mt-2 text-[13px] font-medium leading-[1.4] text-[#2563eb]">
                                  {formatListingPrice(listing)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="border-b border-l border-[#ededed] px-2 py-3 align-top">
                            <FigmaListingStatusPill status={listing.status} />
                          </td>
                          <td className="border-b border-l border-[#ededed] px-2 py-3 align-top text-[12px] leading-[1.4] text-[#24272c]">
                            {formatDashboardDate(listing.created_at)}
                          </td>
                          <td className="border-b border-l border-[#ededed] py-3 px-2 align-top">
                            <div className="flex justify-center">
                              <ListingRowActions
                                listing={listing}
                                onDelete={handleDeleteListing}
                                onDuplicate={handleDuplicate}
                                onGoLive={handleGoLive}
                                onHold={handleHold}
                                isDeleting={deletingIds.includes(listing.id)}
                                isPending={pendingIds.includes(listing.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-[27px] flex justify-center gap-[10px]">
              {["<", "1", "2", "3", "4", "...", ">"].map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={item === "<" || item === ">" || item === "..."}
                  className={cn(
                    "flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#ededed] text-[16px] font-medium leading-[1.4]",
                    item === "3"
                      ? "border-[#2563eb] bg-[#2563eb] text-white"
                      : "bg-white text-[#24272c] disabled:text-[#24272c]"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
