"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2, MessageSquare } from "lucide-react";
import { setListingWishlistState } from "@/lib/actions/favorites";
import type { DashboardFavoriteItem } from "@/lib/types/favorites";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingDisplayLocation,
  getListingDisplayTitle,
} from "@/lib/utils/vehicle-display";
import {
  SellerPageHeader,
  SellerSurface,
  formatDashboardCurrency,
  sellerSelectClass,
} from "../seller-dashboard-ui";

type FavoritesGridProps = {
  favorites?: DashboardFavoriteItem[];
};

function getFavoriteSellerName(item: DashboardFavoriteItem) {
  return item.listing.dealer?.name || item.listing.seller?.full_name || "Private Seller";
}

function getFavoriteImage(item: DashboardFavoriteItem) {
  const sortedImages = (item.listing.images || [])
    .slice()
    .sort((left, right) => left.image_order - right.image_order)
    .map((image) => getImageUrl(image.r2_key, "card"));

  return sortedImages[0] || "/placeholder-car.jpg";
}

export function FavoritesGrid({ favorites = [] }: FavoritesGridProps) {
  const [items, setItems] = React.useState(favorites);
  const [sortBy, setSortBy] = React.useState("newest");
  const [error, setError] = React.useState<string | null>(null);
  const [pendingListingId, setPendingListingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(favorites);
  }, [favorites]);

  const sortedItems = React.useMemo(() => {
    const next = [...items];

    switch (sortBy) {
      case "oldest":
        next.sort(
          (left, right) =>
            new Date(left.savedAt).getTime() - new Date(right.savedAt).getTime()
        );
        break;
      case "price_low":
        next.sort((left, right) => left.listing.price - right.listing.price);
        break;
      case "price_high":
        next.sort((left, right) => right.listing.price - left.listing.price);
        break;
      default:
        next.sort(
          (left, right) =>
            new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime()
        );
    }

    return next;
  }, [items, sortBy]);

  const handleRemoveFavorite = (listingId: string) => {
    const previousItems = items;
    setError(null);
    setPendingListingId(listingId);
    setItems((current) => current.filter((item) => item.listing.id !== listingId));

    void (async () => {
      const result = await setListingWishlistState(listingId, false);

      if (result.error) {
        setItems(previousItems);
        setError(
          result.error === "AUTH_REQUIRED"
            ? "Sign in again to manage your wishlist."
            : result.error
        );
      }

      setPendingListingId(null);
    })();
  };

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="My Favorite"
        description="Saved vehicles from around the marketplace that you want to revisit, compare, or message about later."
      />

      <SellerSurface className="overflow-hidden">
        {error ? (
          <div className="border-b border-[#fcd7d4] bg-[#fff3f2] px-5 py-4 text-[14px] text-[#d92d20]">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-b border-[#ededed] px-5 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] text-[#7a7a7a]">{items.length} cars in wishlist</p>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className={sellerSelectClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_low">Price low to high</option>
            <option value="price_high">Price high to low</option>
          </select>
        </div>

        {sortedItems.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto max-w-xl space-y-3">
              <h2 className="font-heading text-[28px] font-semibold text-[#202224]">
                Your wishlist is empty
              </h2>
              <p className="text-[14px] leading-6 text-[#767676]">
                Save vehicles from search and detail pages to keep track of the ones you want
                to compare or revisit later.
              </p>
              <Link
                href="/search"
                className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Browse vehicles
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2 2xl:grid-cols-4">
            {sortedItems.map((item) => {
              const listing = item.listing;
              const image = getFavoriteImage(item);
              const sellerName = getFavoriteSellerName(item);

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-[24px] border border-[#ededed] bg-white"
                >
                  <div className="relative aspect-[1.2/1] bg-[linear-gradient(135deg,#f0f4ff,#efe7dd)]">
                    <Link href={`/vehicle/${listing.id}`} className="absolute inset-0">
                      <Image
                        src={image}
                        alt={getListingDisplayTitle(listing)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(listing.id)}
                      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#f04438] shadow-sm"
                      aria-label="Remove from favorites"
                      disabled={pendingListingId === listing.id}
                    >
                      {pendingListingId === listing.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className="h-5 w-5 fill-current" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <Link href={`/vehicle/${listing.id}`}>
                        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                          {getListingDisplayTitle(listing)}
                        </h2>
                      </Link>
                      <p className="mt-2 text-[14px] font-semibold text-[#2563eb]">
                        {formatDashboardCurrency(listing.price)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                        {getListingDisplayLocation(listing, { fallback: "Location unavailable" })}
                      </div>
                      <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                        {listing.transmission || "Transmission N/A"}
                      </div>
                      <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                        {listing.fuel_type || "Fuel N/A"}
                      </div>
                      <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                        {listing.mileage ? `${listing.mileage.toLocaleString()} km` : "Mileage N/A"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-[#efefef] pt-4">
                      <div>
                        <p className="text-[12px] text-[#9a9a9a]">Seller</p>
                        <p className="text-[13px] font-semibold text-[#202224]">{sellerName}</p>
                      </div>
                      <Link
                        href={`/vehicle/${listing.id}`}
                        className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#2563eb] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1d4ed8]"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Open listing
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SellerSurface>
    </div>
  );
}
