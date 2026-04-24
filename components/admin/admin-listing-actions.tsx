"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  ShieldX,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  approveListing,
  deleteAdminListing,
  rejectListing,
  setListingFeatured,
  updateAdminListingStatus,
} from "@/lib/actions/listings";
import type { AdminDashboardListing } from "@/lib/data/admin";

type ActionResult = { error?: string; success?: boolean };

const itemClass =
  "flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#374151] transition hover:bg-[#f4f7fb] disabled:cursor-not-allowed disabled:opacity-60";

export function AdminListingActions({ listing }: { listing: AdminDashboardListing }) {
  const router = useRouter();
  const detailsRef = React.useRef<HTMLDetailsElement | null>(null);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);
  const isPending = Boolean(pendingAction);

  const runAction = async (
    actionKey: string,
    action: () => Promise<ActionResult>
  ) => {
    setPendingAction(actionKey);
    try {
      const result = await action();
      if (result.error) {
        window.alert(result.error);
        return;
      }
      detailsRef.current?.removeAttribute("open");
      router.refresh();
    } catch {
      window.alert("Could not update this listing. Try again.");
    } finally {
      setPendingAction(null);
    }
  };

  const handleActivate = () => {
    void runAction(
      "active",
      () =>
        listing.status === "pending"
          ? approveListing(listing.id)
          : updateAdminListingStatus(listing.id, "active")
    );
  };

  const handleReject = () => {
    const reason =
      listing.status === "pending"
        ? window.prompt("Rejection reason (optional):")
        : "";
    if (reason === null) return;

    void runAction(
      "reject",
      () =>
        listing.status === "pending"
          ? rejectListing(listing.id, reason || undefined)
          : updateAdminListingStatus(listing.id, "rejected")
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${listing.title}"? This removes it from admin, seller, and public views.`
    );
    if (!confirmed) return;
    void runAction("delete", () => deleteAdminListing(listing.id));
  };

  return (
    <details ref={detailsRef} className="relative inline-block text-left">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center justify-center gap-1 rounded-[9px] border border-[#d1d5db] bg-white px-3 text-[12px] font-semibold text-[#374151] transition hover:border-[#2563eb] hover:text-[#2563eb] [&::-webkit-details-marker]:hidden">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Actions
        <ChevronDown className="h-3.5 w-3.5" />
      </summary>

      <div className="absolute right-0 top-11 z-50 w-[220px] rounded-[10px] border border-[#e5e7eb] bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
        <Link href={`/vehicle/${listing.id}`} className={itemClass}>
          <ArrowUpRight className="h-4 w-4" />
          View listing
        </Link>

        {listing.status !== "active" ? (
          <button
            type="button"
            onClick={handleActivate}
            disabled={isPending}
            className={itemClass}
          >
            <CheckCircle2 className="h-4 w-4 text-[#059669]" />
            {listing.status === "pending" ? "Approve listing" : "Set active"}
          </button>
        ) : null}

        {listing.status !== "pending" ? (
          <button
            type="button"
            onClick={() =>
              void runAction("pending", () =>
                updateAdminListingStatus(listing.id, "pending")
              )
            }
            disabled={isPending}
            className={itemClass}
          >
            <Clock3 className="h-4 w-4 text-[#d97706]" />
            Send to review
          </button>
        ) : null}

        {listing.status !== "rejected" ? (
          <button
            type="button"
            onClick={handleReject}
            disabled={isPending}
            className={itemClass}
          >
            <XCircle className="h-4 w-4 text-[#dc2626]" />
            Reject listing
          </button>
        ) : null}

        <div className="my-1 border-t border-[#eef2f7]" />

        <button
          type="button"
          onClick={() =>
            void runAction("feature", () =>
              setListingFeatured(listing.id, !listing.isFeatured)
            )
          }
          disabled={isPending}
          className={itemClass}
        >
          <Star className="h-4 w-4 text-[#2563eb]" />
          {listing.isFeatured ? "Remove featured" : "Feature listing"}
        </button>

        {listing.status !== "reserved" ? (
          <button
            type="button"
            onClick={() =>
              void runAction("reserved", () =>
                updateAdminListingStatus(listing.id, "reserved")
              )
            }
            disabled={isPending}
            className={itemClass}
          >
            <ShieldX className="h-4 w-4 text-[#7c3aed]" />
            Hold listing
          </button>
        ) : null}

        {listing.status !== "sold" ? (
          <button
            type="button"
            onClick={() =>
              void runAction("sold", () =>
                updateAdminListingStatus(listing.id, "sold")
              )
            }
            disabled={isPending}
            className={itemClass}
          >
            <CheckCircle2 className="h-4 w-4 text-[#059669]" />
            Mark sold
          </button>
        ) : null}

        {listing.status !== "expired" ? (
          <button
            type="button"
            onClick={() =>
              void runAction("expired", () =>
                updateAdminListingStatus(listing.id, "expired")
              )
            }
            disabled={isPending}
            className={itemClass}
          >
            <Clock3 className="h-4 w-4 text-[#6b7280]" />
            Expire listing
          </button>
        ) : null}

        <div className="my-1 border-t border-[#eef2f7]" />

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#dc2626] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Delete listing
        </button>
      </div>
    </details>
  );
}
