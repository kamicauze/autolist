"use client";

import * as React from "react";
import Image from "next/image";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gauge,
  Hash,
  Mail,
  Search,
  Tag,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { AdminListingActions } from "@/components/admin/admin-listing-actions";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import { LISTING_STATUS_META, type ListingStatus } from "@/lib/constants/marketplace";
import type { AdminListingsOverviewData } from "@/lib/data/admin";
import { getImageUrl } from "@/lib/utils/listings";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function listingStatusTone(status: string) {
  if (status === "active") return "green" as const;
  if (status === "pending") return "amber" as const;
  if (status === "rejected") return "red" as const;
  return "slate" as const;
}

function formatSpec(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not set";
  return String(value).replace(/_/g, " ");
}

function formatMileage(value: number | null) {
  if (!value) return "Not set";
  return `${value.toLocaleString("en-KE")} km`;
}

const statusOptions = Object.entries(LISTING_STATUS_META) as Array<
  [ListingStatus, (typeof LISTING_STATUS_META)[ListingStatus]]
>;

export function AdminListingsOverviewLive({ data }: { data: AdminListingsOverviewData }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | ListingStatus>("all");
  const [sellerType, setSellerType] = React.useState<"all" | "Dealer" | "Private">("all");
  const [featured, setFeatured] = React.useState<"all" | "featured" | "standard">("all");
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

  const filteredListings = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.listings.filter((listing) => {
      const searchableText = [
        listing.title,
        listing.subtitle,
        listing.sellerName,
        listing.sellerEmail,
        listing.dealerName,
        listing.sellerType,
        listing.status,
        listing.condition,
        listing.transmission,
        listing.fuelType,
        listing.color,
        listing.description,
        String(listing.price),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesStatus = status === "all" || listing.status === status;
      const matchesSellerType = sellerType === "all" || listing.sellerType === sellerType;
      const matchesFeatured =
        featured === "all" ||
        (featured === "featured" ? listing.isFeatured : !listing.isFeatured);

      return matchesQuery && matchesStatus && matchesSellerType && matchesFeatured;
    });
  }, [data.listings, featured, query, sellerType, status]);

  const hasActiveFilters =
    query.trim().length > 0 || status !== "all" || sellerType !== "all" || featured !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setSellerType("all");
    setFeatured("all");
  };

  const toggleExpanded = (listingId: string) => {
    setExpandedIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId]
    );
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="All Listings" />

      {data.error ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] leading-6 text-[#991b1b]">
          Admin listings could not be loaded: {data.error}
        </div>
      ) : data.notice ? (
        <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[13px] leading-6 text-[#9a3412]">
          {data.notice}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="All listings"
          value={data.total.toLocaleString("en-KE")}
          icon={<CarFront className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Active"
          value={data.stats.active.toLocaleString("en-KE")}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Pending review"
          value={data.stats.pending.toLocaleString("en-KE")}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Rejected"
          value={data.stats.rejected.toLocaleString("en-KE")}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        title="Listings"
        description="Live inventory across active, pending, sold, and expired states."
      >
        <div
          data-tour="listings-filters"
          className="mb-5 grid gap-3 xl:grid-cols-[minmax(280px,1.4fr)_180px_160px_160px_auto]"
        >
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-3">
            <Search className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search listing, seller, dealer, price..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
            aria-label="Filter by listing status"
          >
            <option value="all">All statuses</option>
            {statusOptions.map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>

          <select
            value={sellerType}
            onChange={(event) => setSellerType(event.target.value as typeof sellerType)}
            className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
            aria-label="Filter by seller type"
          >
            <option value="all">All sellers</option>
            <option value="Dealer">Dealers</option>
            <option value="Private">Private sellers</option>
          </select>

          <select
            value={featured}
            onChange={(event) => setFeatured(event.target.value as typeof featured)}
            className="h-11 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] outline-none"
            aria-label="Filter by featured state"
          >
            <option value="all">All visibility</option>
            <option value="featured">Featured only</option>
            <option value="standard">Not featured</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d1d5db] bg-white px-4 text-[13px] font-semibold text-[#374151] transition hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-[#6b7280]">
          <span>
            Showing {filteredListings.length.toLocaleString("en-KE")} of{" "}
            {data.listings.length.toLocaleString("en-KE")} loaded listings
          </span>
          {hasActiveFilters ? (
            <span className="font-medium text-[#2563eb]">Filters active</span>
          ) : null}
        </div>

        <AdminDataTable columns={["", "Listing", "Seller", "Status", "Price", "Created", "Actions"]}>
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => {
              const isExpanded = expandedIds.includes(listing.id);

              return (
                <React.Fragment key={listing.id}>
                  <tr className="border-b border-[#f1f5f9] last:border-b-0">
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(listing.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white text-[#6b7280] transition hover:border-[#2563eb] hover:text-[#2563eb]"
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${listing.title}`}
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-[#111827]">{listing.title}</p>
                          {listing.isFeatured ? (
                            <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1d4ed8]">
                              Featured
                            </span>
                          ) : null}
                        </div>
                        {listing.subtitle ? (
                          <p className="mt-1 text-[12px] text-[#6b7280]">{listing.subtitle}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[13px] font-medium text-[#111827]">{listing.sellerName}</p>
                        <p className="mt-1 text-[12px] text-[#6b7280]">
                          {listing.dealerName || listing.sellerType}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusPill
                        label={LISTING_STATUS_META[listing.status]?.label || listing.status.replace(/_/g, " ")}
                        tone={listingStatusTone(listing.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#111827]">
                      {formatCurrency(listing.price, listing.currency)}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(listing.createdAt)}</td>
                    <td className="px-6 py-4 text-right" data-tour="listings-actions">
                      <AdminListingActions listing={listing} />
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.8fr)_minmax(240px,0.8fr)]">
                          <div>
                            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                              <CarFront className="h-4 w-4 text-[#2563eb]" />
                              Listing detail
                            </p>
                            <div className="mt-3 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                              <div className="overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white">
                                <div className="relative aspect-[4/3] w-full bg-[#eef2f7]">
                                  <Image
                                    src={getImageUrl(listing.coverImageKey || "", "card")}
                                    alt={listing.coverImageAlt || listing.title}
                                    fill
                                    className="object-cover"
                                    sizes="180px"
                                  />
                                </div>
                                <div className="px-3 py-2 text-[11px] font-medium text-[#6b7280]">
                                  {listing.imageCount > 0
                                    ? `${listing.imageCount} photo${listing.imageCount === 1 ? "" : "s"}`
                                    : "No cover image"}
                                </div>
                              </div>

                              <div className="grid gap-2 text-[13px] text-[#374151] sm:grid-cols-2">
                                <span>Make: <strong className="font-semibold text-[#111827]">{formatSpec(listing.make)}</strong></span>
                                <span>Model: <strong className="font-semibold text-[#111827]">{formatSpec(listing.model)}</strong></span>
                                <span>Year: <strong className="font-semibold text-[#111827]">{listing.year}</strong></span>
                                <span>Body: <strong className="font-semibold capitalize text-[#111827]">{formatSpec(listing.bodyType)}</strong></span>
                                <span>Condition: <strong className="font-semibold capitalize text-[#111827]">{formatSpec(listing.condition)}</strong></span>
                                <span className="flex items-center gap-1.5">
                                  <Gauge className="h-3.5 w-3.5 text-[#6b7280]" />
                                  <strong className="font-semibold text-[#111827]">{formatMileage(listing.mileage)}</strong>
                                </span>
                                <span>Transmission: <strong className="font-semibold capitalize text-[#111827]">{formatSpec(listing.transmission)}</strong></span>
                                <span>Fuel: <strong className="font-semibold capitalize text-[#111827]">{formatSpec(listing.fuelType)}</strong></span>
                                <span>Color: <strong className="font-semibold capitalize text-[#111827]">{formatSpec(listing.color)}</strong></span>
                              </div>
                            </div>
                            {listing.description ? (
                              <p className="mt-4 line-clamp-2 text-[13px] leading-6 text-[#4b5563]">
                                {listing.description}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                              <UserRound className="h-4 w-4 text-[#2563eb]" />
                              Seller
                            </p>
                            <div className="mt-3 space-y-2 text-[13px] text-[#374151]">
                              <p>{listing.sellerName}</p>
                              <p className="flex items-center gap-1.5 text-[#6b7280]">
                                <Mail className="h-3.5 w-3.5" />
                                {listing.sellerEmail || "No email"}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-[#6b7280]" />
                                {listing.dealerName ? `Dealer: ${listing.dealerName}` : listing.sellerType}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                              <Hash className="h-4 w-4 text-[#2563eb]" />
                              Admin metadata
                            </p>
                            <div className="mt-3 space-y-2 text-[13px] text-[#374151]">
                              <p className="break-all">ID: <span className="font-mono text-[12px] text-[#111827]">{listing.id}</span></p>
                              <p>Visibility: <strong className="font-semibold text-[#111827]">{listing.isFeatured ? "Featured" : "Standard"}</strong></p>
                              <p className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-[#6b7280]" />
                                Created {formatDate(listing.createdAt)}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5 text-[#6b7280]" />
                                Updated {formatDate(listing.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-[#6b7280]">
                No listings match the current search or filters.
              </td>
            </tr>
          )}
        </AdminDataTable>
      </AdminSectionCard>
    </div>
  );
}
