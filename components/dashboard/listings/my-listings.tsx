"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  Check,
  CircleDollarSign,
  Fuel,
  Gauge,
  MapPin,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { deleteListing } from "@/lib/actions/listings";
import { getImageUrl } from "@/lib/utils/listings";
import type { Listing } from "@/lib/types/listing";
import { getListingDisplayTitle, getListingSubtitle } from "@/lib/utils/vehicle-display";
import {
  SellerLinkArrow,
  SellerPageHeader,
  SellerPagination,
  SellerStatusPill,
  SellerSurface,
  SellerTabs,
  formatDashboardCurrency,
  listingBidCards,
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

const bidStatusOptions = ["Available", "Claimed"] as const;

const mockOffersByBidId: Record<
  string,
  Array<{
    id: string;
    dealer: string;
    submittedAgo: string;
    offer: string;
    status: string;
    message: string;
    buyer: string;
  }>
> = {
  "1": [
    {
      id: "offer-1",
      dealer: "Premium Luxury Car Group",
      submittedAgo: "2 hours ago",
      offer: "KES 6,950,000",
      status: "Pending review",
      message: "Interested in this vehicle. Can inspect tomorrow if price is agreed.",
      buyer: "John Smith",
    },
    {
      id: "offer-2",
      dealer: "Elite Auto Traders",
      submittedAgo: "5 hours ago",
      offer: "KES 6,880,000",
      status: "Pending review",
      message: "Ready to move quickly if service records are available.",
      buyer: "Sarah Kariuki",
    },
  ],
  "2": [
    {
      id: "offer-3",
      dealer: "Cityline Prestige",
      submittedAgo: "1 day ago",
      offer: "KES 12,150,000",
      status: "Negotiating",
      message: "Buyer requested one more interior walkaround before confirming.",
      buyer: "Kelvin Ouma",
    },
  ],
  "3": [
    {
      id: "offer-4",
      dealer: "Westlands Auto Hub",
      submittedAgo: "3 days ago",
      offer: "KES 3,100,000",
      status: "Expired",
      message: "Initial offer expired after financing window closed.",
      buyer: "Mary Njeri",
    },
  ],
};

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

function OfferModal({
  bidId,
  bidTitle,
  bidPrice,
  onClose,
}: {
  bidId: string;
  bidTitle: string;
  bidPrice: string;
  onClose: () => void;
}) {
  const offers = mockOffersByBidId[bidId] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 px-4 py-10">
      <div className="max-h-[85vh] w-full max-w-[780px] overflow-y-auto rounded-[28px] border border-[#ededed] bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#ededed] pb-4">
          <div>
            <h3 className="font-heading text-[28px] font-semibold text-[#202224]">
              Offers for {bidTitle}
            </h3>
            <p className="mt-1 text-[14px] text-[#7b7b7b]">{offers.length} offers received</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 pt-5">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-[22px] border border-[#ededed] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#2563eb] text-white">
                    <CarFront className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[18px] font-semibold text-[#202224]">{bidTitle}</h4>
                    <p className="mt-1 text-[13px] text-[#7b7b7b]">
                      {offer.dealer} • {offer.submittedAgo}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-[#7b7b7b]">
                      <span>{listingBidCards.find((item) => item.id === bidId)?.meta[0] ?? "2021"}</span>
                      <span>{listingBidCards.find((item) => item.id === bidId)?.meta[3] ?? "48,000 km"}</span>
                      <span>{listingBidCards.find((item) => item.id === bidId)?.meta[2] ?? "Good"}</span>
                    </div>
                  </div>
                </div>

                <SellerStatusPill label={offer.status} tone="amber" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] text-[#8a8a8a]">Your asking price</p>
                  <p className="mt-1 text-[18px] font-semibold text-[#202224]">{bidPrice}</p>
                </div>
                <div className="rounded-[16px] bg-[#eefaf1] px-4 py-3">
                  <p className="text-[11px] text-[#5b7e68]">Dealer&apos;s offer</p>
                  <p className="mt-1 text-[18px] font-semibold text-[#16a34a]">{offer.offer}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] bg-[#f5f9ff] px-4 py-3">
                <p className="text-[12px] font-medium text-[#6580b2]">Message from dealer</p>
                <p className="mt-1 text-[14px] leading-6 text-[#202224]">{offer.message}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#202224]">{offer.buyer}</p>
                  <p className="text-[12px] text-[#7b7b7b]">{offer.dealer}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#16a34a] px-5 text-[13px] font-semibold text-white">
                    <Check className="h-4 w-4" />
                    Accept offer
                  </button>
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#fecaca] bg-white px-5 text-[13px] font-semibold text-[#ef4444]">
                    <X className="h-4 w-4" />
                    Decline offer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[13px] font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function MyListings({ listings }: MyListingsProps) {
  const [listingItems, setListingItems] = React.useState(listings);
  const [tab, setTab] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [bidStatus, setBidStatus] = React.useState<(typeof bidStatusOptions)[number]>("Available");
  const [openBidId, setOpenBidId] = React.useState<string | null>(null);

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

  const filteredBidCards = listingBidCards.filter((bid, index) => {
    const matchesQuery =
      bid.title.toLowerCase().includes(query.toLowerCase()) ||
      bid.submittedBy.toLowerCase().includes(query.toLowerCase());
    const derivedStatus = index % 2 === 0 ? "Claimed" : "Available";
    return matchesQuery && derivedStatus === bidStatus;
  });

  const openBid = listingBidCards.find((item) => item.id === openBidId) ?? null;

  return (
    <>
      <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="All Listing"
        description="Review live inventory, check listing health, and respond to bids from interested buyers."
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
            <SellerTabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "all", label: "All listing" },
              { value: "bids", label: "Your bids" },
            ]}
          />

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
            <button className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#6e6e6e]">
              <CalendarDays className="h-4 w-4" />
              Jan 01 - Jan 30
            </button>
            {tab === "all" ? (
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
            ) : (
              <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4 py-3 text-[13px] text-[#5f5f5f]">
                <span>Filter by status:</span>
                {bidStatusOptions.map((option) => {
                  const active = option === bidStatus;
                  const count = option === "Available" ? 1 : 2;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBidStatus(option)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium ${
                        active ? "bg-[#eef4ff] text-[#2563eb]" : "bg-[#f5f5f5] text-[#6e6e6e]"
                      }`}
                    >
                      {option === "Available" ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <CircleDollarSign className="h-3.5 w-3.5" />
                      )}
                      {option}
                      <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[11px]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {tab === "all" ? (
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
        ) : (
          <div className="space-y-4 p-5">
            {filteredBidCards.map((bid) => {
              const derivedStatus = bidStatus === "Available" ? "Available for bidding" : "Claimed by Premium Luxury Car Group";
              const derivedTone = bidStatus === "Available" ? "green" : "red";

              return (
              <article
                key={bid.id}
                className="rounded-[24px] border border-[#ededed] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]"
              >
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#2563eb] text-white">
                        <CarFront className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
                          {bid.title}
                        </h2>
                        <p className="mt-1 text-[13px] text-[#7b7b7b]">{bid.submittedBy}</p>
                      </div>
                    </div>

                    <SellerStatusPill label={derivedStatus} tone={derivedTone} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
                      <p className="text-[11px] text-[#8a8a8a]">Year</p>
                      <p className="mt-1 text-[15px] font-semibold text-[#202224]">
                        {bid.meta[0]}
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
                      <p className="text-[11px] text-[#8a8a8a]">Mileage</p>
                      <p className="mt-1 text-[15px] font-semibold text-[#202224]">
                        {bid.meta[3]}
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
                      <p className="text-[11px] text-[#8a8a8a]">Condition</p>
                      <p className="mt-1 text-[15px] font-semibold text-[#202224]">
                        {bid.meta[2]}
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-[#eaf2ff] px-4 py-3">
                      <p className="text-[11px] text-[#4f6eb4]">Asking Price</p>
                      <p className="mt-1 text-[15px] font-semibold text-[#202224]">
                        {bid.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#f5f9ff] px-4 py-3">
                    <p className="text-[13px] text-[#5f6a7e]">
                      {(mockOffersByBidId[bid.id] ?? []).length} offers received
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenBidId(bid.id)}
                      className="inline-flex items-center text-[13px] font-semibold text-[#2563eb]"
                    >
                      <SellerLinkArrow>View offers</SellerLinkArrow>
                    </button>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        )}

        <SellerPagination />
      </SellerSurface>
      </div>

      {openBid ? (
        <OfferModal
          bidId={openBid.id}
          bidTitle={openBid.title}
          bidPrice={openBid.price}
          onClose={() => setOpenBidId(null)}
        />
      ) : null}
    </>
  );
}
