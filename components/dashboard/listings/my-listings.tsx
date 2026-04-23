"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Fuel,
  Gauge,
  MapPin,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { deleteListing } from "@/lib/actions/listings";
import { getImageUrl } from "@/lib/utils/listings";
import type { Listing } from "@/lib/types/listing";
import { getListingDisplayTitle, getListingSubtitle } from "@/lib/utils/vehicle-display";
import {
  SellerPageHeader,
  SellerStatusPill,
  SellerSurface,
  formatDashboardCurrency,
} from "../seller-dashboard-ui";

interface MyListingsProps {
  listings: Listing[];
}

function listingTone(status: Listing["status"]) {
  if (status === "active") return "green" as const;
  if (status === "pending") return "amber" as const;
  if (status === "draft") return "blue" as const;
  return "neutral" as const;
}

function ListingSummaryCard({
  listing,
  onDeleted,
}: {
  listing: Listing;
  onDeleted: (listingId: string) => void;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = React.useTransition();
  const title = getListingDisplayTitle(listing);
  const subtitle = getListingSubtitle(listing);
  const image = listing.images?.sort((a, b) => a.image_order - b.image_order)[0];
  const imageUrl = image ? getImageUrl(image.r2_key, "card") : "/placeholder-car.jpg";

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${title}"? This will remove it from seller and public views.`);
    if (!confirmed) return;

    startDeleteTransition(async () => {
      const result = await deleteListing(listing.id);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      onDeleted(listing.id);
      router.refresh();
    });
  };

  return (
    <article className="rounded-[24px] border border-[#ededed] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="relative h-[84px] w-[108px] shrink-0 overflow-hidden rounded-[18px] bg-[#f3f4f6]">
            <Image src={imageUrl} alt={title} fill className="object-cover" sizes="108px" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-heading text-[24px] font-semibold text-[#202224]">{title}</h2>
            {subtitle ? <p className="mt-1 truncate text-[13px] text-[#6b7280]">{subtitle}</p> : null}
            <p className="mt-1 text-[13px] text-[#7b7b7b]">
              Submitted on{" "}
              {new Date(listing.created_at).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SellerStatusPill
            label={listing.status[0].toUpperCase() + listing.status.slice(1)}
            tone={listingTone(listing.status)}
          />
          {listing.is_featured ? <SellerStatusPill label="Featured" tone="blue" /> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
          <p className="text-[11px] text-[#8a8a8a]">Year</p>
          <p className="mt-1 text-[15px] font-semibold text-[#202224]">{listing.year}</p>
        </div>
        <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
          <p className="text-[11px] text-[#8a8a8a]">Mileage</p>
          <p className="mt-1 text-[15px] font-semibold text-[#202224]">
            {listing.mileage ? `${listing.mileage.toLocaleString()} km` : "Not provided"}
          </p>
        </div>
        <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
          <p className="text-[11px] text-[#8a8a8a]">Condition</p>
          <p className="mt-1 text-[15px] font-semibold text-[#202224]">
            {(listing.condition ?? "Not specified").replace(/_/g, " ")}
          </p>
        </div>
        <div className="rounded-[16px] bg-[#eaf2ff] px-4 py-3">
          <p className="text-[11px] text-[#4f6eb4]">Asking Price</p>
          <p className="mt-1 text-[15px] font-semibold text-[#202224]">
            {formatDashboardCurrency(listing.price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#f5f9ff] px-4 py-3">
        <div className="flex flex-wrap gap-4 text-[13px] text-[#5f6a7e]">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#2563eb]" />
            {(listing.dealer?.city || "Nairobi").trim()}
          </span>
          <span className="inline-flex items-center gap-2">
            <Fuel className="h-4 w-4 text-[#2563eb]" />
            {listing.fuel_type || "Not specified"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-4 w-4 text-[#2563eb]" />
            {listing.transmission || "Transmission n/a"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/vehicle/${listing.id}`}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#dbe3f5] bg-white px-4 text-[13px] font-semibold text-[#2563eb]"
          >
            View listing
          </Link>
          <Link
            href={`/dashboard/listings/${listing.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#2563eb] px-4 text-[13px] font-semibold text-white"
          >
            Edit listing
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#fecaca] bg-white px-4 text-[13px] font-semibold text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function MyListings({ listings }: MyListingsProps) {
  const [listingItems, setListingItems] = React.useState(listings);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All status");

  React.useEffect(() => {
    setListingItems(listings);
  }, [listings]);

  const filteredListings = listingItems.filter((listing) => {
    const title = getListingDisplayTitle(listing).toLowerCase();
    const subtitle = getListingSubtitle(listing).toLowerCase();
    const matchesQuery = title.includes(query.toLowerCase());
    const matchesStatus = status === "All status" || listing.status === status.toLowerCase();
    return (matchesQuery || subtitle.includes(query.toLowerCase())) && matchesStatus;
  });

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="All Listings"
        description="Review live inventory, check listing health, and manage the vehicles already tied to your account."
        action={
          <Link
            href="/dashboard/listings/new"
            className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </Link>
        }
      />

      <SellerSurface className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#ededed] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Inventory</h2>
            <p className="mt-1 text-[13px] text-[#7a7a7a]">
              Buyer bid management stays hidden until that workflow is backed by real data.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-12 min-w-[240px] items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
              <Search className="h-4 w-4 text-[#939393]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search here..."
                className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
              />
            </div>
            <div className="flex h-12 items-center gap-2 rounded-[14px] border border-[#ededed] bg-white px-4">
              <Settings2 className="h-4 w-4 text-[#939393]" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="border-0 bg-transparent text-[14px] text-[#202224] outline-none"
              >
                <option>All status</option>
                <option>active</option>
                <option>pending</option>
                <option>draft</option>
                <option>sold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5">
          {filteredListings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d8d8d8] bg-[#faf9f7] px-6 py-14 text-center">
              <p className="font-heading text-[24px] font-semibold text-[#202224]">
                No listings match the current filter
              </p>
              <p className="mx-auto mt-2 max-w-xl text-[14px] leading-6 text-[#7d7d7d]">
                Create your first vehicle package or widen the current search and status filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <ListingSummaryCard
                  key={listing.id}
                  listing={listing}
                  onDeleted={(listingId) =>
                    setListingItems((current) => current.filter((item) => item.id !== listingId))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </SellerSurface>
    </div>
  );
}
