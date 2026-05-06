"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils/listings";
import type { DuplicateReviewSuggestion } from "@/lib/types/duplicate-review";
import type { Listing } from "@/lib/types/listing";
import {
  AdminFeedbackBanner,
  AdminPageHeader,
  AdminPromptDialog,
  type AdminFeedbackState,
} from "./admin-ui";

interface AdminListingsClientProps {
  listings: Listing[];
  duplicateSuggestions: Record<string, DuplicateReviewSuggestion>;
}

function formatKES(price: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDuplicateTone(severity: DuplicateReviewSuggestion["severity"]) {
  if (severity === "high") return "border-red-200 bg-red-50 text-red-700";
  if (severity === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function AdminListingsClient({ listings, duplicateSuggestions }: AdminListingsClientProps) {
  const router = useRouter();
  const [processing, setProcessing] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<AdminFeedbackState>(null);
  const [rejectingListingId, setRejectingListingId] = React.useState<string | null>(null);

  async function handleApprove(listingId: string) {
    setProcessing(listingId);
    setFeedback(null);
    try {
      const { approveListing } = await import("@/lib/actions/listings");
      const result = await approveListing(listingId);
      if (result.error) {
        setFeedback({ tone: "error", message: result.error });
        return;
      }
      router.refresh();
    } catch {
      setFeedback({ tone: "error", message: "An unexpected error occurred." });
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(listingId: string, reason: string) {
    setProcessing(listingId);
    setFeedback(null);
    try {
      const { rejectListing } = await import("@/lib/actions/listings");
      const result = await rejectListing(listingId, reason || undefined);
      if (result.error) {
        setFeedback({ tone: "error", message: result.error });
        return;
      }
      setRejectingListingId(null);
      router.refresh();
    } catch {
      setFeedback({ tone: "error", message: "An unexpected error occurred." });
    } finally {
      setProcessing(null);
    }
  }

  const rejectingListing = listings.find((listing) => listing.id === rejectingListingId) ?? null;

  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Listing Review" />
        <p className="text-sm text-muted-foreground">
          Review and approve or reject new listing submissions.
        </p>
        <AdminFeedbackBanner feedback={feedback} />
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">No pending listings to review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Listing Review"
        action={
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            {listings.length} Pending
          </Badge>
        }
      />

      <p className="text-sm text-muted-foreground">
        {listings.length} listing{listings.length !== 1 ? "s" : ""} awaiting review.
      </p>

      <AdminFeedbackBanner feedback={feedback} />

      <div data-tour="admin-page-table" className="space-y-4">
        {listings.map((listing) => {
          const title = `${listing.year} ${listing.make} ${listing.model}`;
          const coverImage = listing.images
            ?.sort((a, b) => a.image_order - b.image_order)[0];
          const imageUrl = coverImage ? getImageUrl(coverImage.r2_key, "card") : null;
          const isProcessing = processing === listing.id;
          const seller = listing.seller as { id: string; full_name: string | null; email?: string } | undefined;
          const duplicateSuggestion = duplicateSuggestions[listing.id];

          return (
            <div
              key={listing.id}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100 relative">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="mt-1 text-sm font-medium text-primary">{formatKES(listing.price)}</p>
                    </div>
                    {duplicateSuggestion && (
                      <div
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getDuplicateTone(
                          duplicateSuggestion.severity
                        )}`}
                      >
                        {duplicateSuggestion.status === "review"
                          ? duplicateSuggestion.headline
                          : "Duplicate check clear"}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {listing.condition && (
                      <span className="capitalize">{listing.condition.replace(/_/g, " ")}</span>
                    )}
                    {listing.mileage && <span>{listing.mileage.toLocaleString()} km</span>}
                    {listing.transmission && <span>{listing.transmission}</span>}
                    {listing.images && (
                      <span>{listing.images.length} photo{listing.images.length !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span>Seller: {seller?.full_name || seller?.email || "Unknown"}</span>
                    <span className="mx-2">|</span>
                    <span>Submitted: {formatDate(listing.created_at)}</span>
                  </div>
                  {listing.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500">{listing.description}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2 self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingListingId(listing.id)}
                    disabled={isProcessing}
                    className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(listing.id)}
                    disabled={isProcessing}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </div>
              </div>

              {duplicateSuggestion && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Duplicate Review Assistant
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{duplicateSuggestion.headline}</p>
                      <p className="mt-1 text-sm text-slate-600">{duplicateSuggestion.summary}</p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {duplicateSuggestion.provider === "openai"
                        ? `OpenAI summary via ${duplicateSuggestion.model}`
                        : duplicateSuggestion.provider === "local_llm"
                          ? `Local AI summary via ${duplicateSuggestion.model}`
                          : "Rule-based scoring"}
                    </p>
                  </div>

                  {duplicateSuggestion.candidates.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {duplicateSuggestion.candidates.map((candidate) => (
                        <div key={candidate.candidate.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {candidate.candidate.year} {candidate.candidate.make} {candidate.candidate.model}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {candidate.confidenceLabel} • {candidate.reason}
                              </p>
                            </div>
                            <Badge variant={candidate.severity === "high" ? "destructive" : "secondary"}>
                              Score {candidate.score}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                            <span>{formatKES(candidate.candidate.price)}</span>
                            <span className="capitalize">{candidate.candidate.status}</span>
                            {candidate.distance.pricePercent != null && (
                              <span>{candidate.distance.pricePercent}% price difference</span>
                            )}
                            {candidate.distance.mileageDelta != null && (
                              <span>{candidate.distance.mileageDelta.toLocaleString()} km gap</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-700">
                    {duplicateSuggestion.reviewerNote}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AdminPromptDialog
        open={Boolean(rejectingListing)}
        onOpenChange={(open) => {
          if (!open) setRejectingListingId(null);
        }}
        title="Reject listing"
        description={
          rejectingListing
            ? `Add an optional rejection reason for ${rejectingListing.year} ${rejectingListing.make} ${rejectingListing.model}.`
            : "Add an optional rejection reason."
        }
        label="Rejection reason"
        placeholder="Duplicate, incomplete details, or failed moderation checks."
        confirmLabel="Reject listing"
        optional
        pending={Boolean(rejectingListingId && processing === rejectingListingId)}
        onConfirm={(reason) => {
          if (!rejectingListingId) return;
          void handleReject(rejectingListingId, reason);
        }}
      />
    </div>
  );
}
