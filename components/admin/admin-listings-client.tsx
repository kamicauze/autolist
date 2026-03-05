"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils/listings";
import type { Listing } from "@/lib/types/listing";

interface AdminListingsClientProps {
  listings: Listing[];
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

export function AdminListingsClient({ listings }: AdminListingsClientProps) {
  const router = useRouter();
  const [processing, setProcessing] = React.useState<string | null>(null);

  async function handleApprove(listingId: string) {
    setProcessing(listingId);
    try {
      const { approveListing } = await import("@/lib/actions/listings");
      const result = await approveListing(listingId);
      if (result.error) {
        alert(`Error: ${result.error}`);
      }
      router.refresh();
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(listingId: string) {
    const reason = prompt("Rejection reason (optional):");
    if (reason === null) return; // User cancelled

    setProcessing(listingId);
    try {
      const { rejectListing } = await import("@/lib/actions/listings");
      const result = await rejectListing(listingId, reason || undefined);
      if (result.error) {
        alert(`Error: ${result.error}`);
      }
      router.refresh();
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setProcessing(null);
    }
  }

  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Listings</h1>
          <p className="text-sm text-muted-foreground">Review and approve or reject new listing submissions</p>
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Listings</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          {listings.length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => {
          const title = `${listing.year} ${listing.make} ${listing.model}`;
          const coverImage = listing.images
            ?.sort((a, b) => a.image_order - b.image_order)[0];
          const imageUrl = coverImage ? getImageUrl(coverImage.r2_key) : null;
          const isProcessing = processing === listing.id;
          const seller = listing.seller as { id: string; full_name: string | null; email?: string } | undefined;

          return (
            <div
              key={listing.id}
              className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              {/* Thumbnail */}
              <div className="h-24 w-32 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative">
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-primary font-medium">{formatKES(listing.price)}</p>
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
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">{listing.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2 self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(listing.id)}
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
          );
        })}
      </div>
    </div>
  );
}
