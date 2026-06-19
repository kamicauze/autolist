"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
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
import {
  AdminConfirmDialog,
  AdminFeedbackBanner,
  AdminPromptDialog,
  type AdminFeedbackState,
} from "./admin-ui";

type ActionResult = { error?: string; success?: boolean };

const itemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#374151] outline-none transition hover:bg-[#f4f7fb] focus:bg-[#f4f7fb] data-[disabled]:pointer-events-none data-[disabled]:opacity-60 disabled:cursor-not-allowed disabled:opacity-60";

export function AdminListingActions({ listing }: { listing: AdminDashboardListing }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);
  const [dialog, setDialog] = React.useState<"reject" | "hold" | "delete" | null>(null);
  const [feedback, setFeedback] = React.useState<AdminFeedbackState>(null);
  const isPending = Boolean(pendingAction);

  const runAction = async (
    actionKey: string,
    action: () => Promise<ActionResult>
  ) => {
    setPendingAction(actionKey);
    setFeedback(null);
    try {
      const result = await action();
      if (result.error) {
        setFeedback({ tone: "error", message: result.error });
        return false;
      }
      setOpen(false);
      router.refresh();
      return true;
    } catch {
      setFeedback({ tone: "error", message: "Could not update this listing. Try again." });
      return false;
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
    setDialog("reject");
  };

  const handleDelete = () => {
    setDialog("delete");
  };

  return (
    <div className="space-y-2">
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-[9px] border border-[#d1d5db] bg-white px-3 text-[12px] font-semibold text-[#374151] transition hover:border-primary hover:text-primary"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Actions
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            collisionPadding={16}
            className="z-[100] w-[220px] rounded-[10px] border border-[#e5e7eb] bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
          >
            <DropdownMenu.Item asChild>
              <Link href={`/vehicle/${listing.id}`} className={itemClass}>
                <ArrowUpRight className="h-4 w-4" />
                View listing
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link href={`/admin/listings/${listing.id}/edit`} className={itemClass}>
                <Edit3 className="h-4 w-4" />
                Edit listing
              </Link>
            </DropdownMenu.Item>

            {listing.status !== "active" ? (
              <DropdownMenu.Item
                onSelect={handleActivate}
                disabled={isPending}
                className={itemClass}
              >
                <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                {listing.status === "pending" ? "Approve listing" : "Set active"}
              </DropdownMenu.Item>
            ) : null}

            {listing.status !== "pending" ? (
              <DropdownMenu.Item
                onSelect={() =>
                  void runAction("pending", () =>
                    updateAdminListingStatus(listing.id, "pending")
                  )
                }
                disabled={isPending}
                className={itemClass}
              >
                <Clock3 className="h-4 w-4 text-[#d97706]" />
                Send to review
              </DropdownMenu.Item>
            ) : null}

            {listing.status !== "rejected" ? (
              <DropdownMenu.Item
                onSelect={handleReject}
                disabled={isPending}
                className={itemClass}
              >
                <XCircle className="h-4 w-4 text-[#dc2626]" />
                Reject listing
              </DropdownMenu.Item>
            ) : null}

            <DropdownMenu.Separator className="my-1 h-px bg-[#eef2f7]" />

            <DropdownMenu.Item
              onSelect={() =>
                void runAction("feature", () =>
                  setListingFeatured(listing.id, !listing.isFeatured)
                )
              }
              disabled={isPending}
              className={itemClass}
            >
              <Star className="h-4 w-4 text-primary" />
              {listing.isFeatured ? "Remove featured" : "Feature listing"}
            </DropdownMenu.Item>

            {listing.status !== "reserved" ? (
              <DropdownMenu.Item
                onSelect={() => setDialog("hold")}
                disabled={isPending}
                className={itemClass}
              >
                <ShieldX className="h-4 w-4 text-[#7c3aed]" />
                Hold listing
              </DropdownMenu.Item>
            ) : null}

            {listing.status !== "sold" ? (
              <DropdownMenu.Item
                onSelect={() =>
                  void runAction("sold", () =>
                    updateAdminListingStatus(listing.id, "sold")
                  )
                }
                disabled={isPending}
                className={itemClass}
              >
                <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                Mark sold
              </DropdownMenu.Item>
            ) : null}

            {listing.status !== "expired" ? (
              <DropdownMenu.Item
                onSelect={() =>
                  void runAction("expired", () =>
                    updateAdminListingStatus(listing.id, "expired")
                  )
                }
                disabled={isPending}
                className={itemClass}
              >
                <Clock3 className="h-4 w-4 text-[#6b7280]" />
                Expire listing
              </DropdownMenu.Item>
            ) : null}

            <DropdownMenu.Separator className="my-1 h-px bg-[#eef2f7]" />

            <DropdownMenu.Item
              onSelect={handleDelete}
              disabled={isPending}
              className="flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#dc2626] outline-none transition hover:bg-[#fff1f1] focus:bg-[#fff1f1] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete listing
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <AdminFeedbackBanner feedback={feedback} className="max-w-[240px] px-3 py-2 text-[12px]" />

      <AdminPromptDialog
        open={dialog === "reject"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDialog(null);
        }}
        title="Reject listing"
        description={`Add the rejection reason for "${listing.title}".`}
        label="Rejection reason"
        placeholder="Missing documents, duplicate listing, or inaccurate listing details."
        confirmLabel="Reject listing"
        pending={pendingAction === "reject"}
        onConfirm={(reason) => {
          void (async () => {
            const ok = await runAction("reject", () =>
              listing.status === "pending"
                ? rejectListing(listing.id, reason)
                : updateAdminListingStatus(listing.id, "rejected", { reason })
            );
            if (ok) setDialog(null);
          })();
        }}
      />

      <AdminPromptDialog
        open={dialog === "hold"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDialog(null);
        }}
        title="Hold listing"
        description={`Add the hold reason for "${listing.title}".`}
        label="Hold reason"
        placeholder="Ownership documents missing, pricing mismatch, or pending verification."
        confirmLabel="Hold listing"
        pending={pendingAction === "reserved"}
        onConfirm={(reason) => {
          void (async () => {
            const ok = await runAction("reserved", () =>
              updateAdminListingStatus(listing.id, "reserved", { reason })
            );
            if (ok) setDialog(null);
          })();
        }}
      />

      <AdminConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDialog(null);
        }}
        title="Delete listing"
        description={`Delete "${listing.title}"? This removes it from admin, seller, and public views.`}
        confirmLabel="Delete listing"
        destructive
        pending={pendingAction === "delete"}
        onConfirm={() => {
          void (async () => {
            const ok = await runAction("delete", () => deleteAdminListing(listing.id));
            if (ok) setDialog(null);
          })();
        }}
      />
    </div>
  );
}
