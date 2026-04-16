"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronRight, GitCompare, Heart } from "lucide-react";
import Image from "next/image";
import { Listing } from "@/lib/types/listing";
import { CarCard } from "@/components/ui/car-card";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingDisplayTitle,
  getListingSubtitle,
} from "@/lib/utils/vehicle-display";
import { cn } from "@/lib/utils";
import { useCompare } from "@/lib/hooks/use-compare";

interface RecommendedCarsProps {
  listings: Listing[];
  sidebarMode?: boolean;
}

export function RecommendedCars({ listings, sidebarMode = false }: RecommendedCarsProps) {
  const { ids, isLoaded, isInCompare, toggleCompare, maxItems } = useCompare();
  const [likedIds, setLikedIds] = React.useState<Record<string, boolean>>({});

  if (listings.length === 0) return null;

  const displayListings = sidebarMode ? listings.slice(0, 4) : listings;

  return (
    <div>
      {!sidebarMode && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended New Cars For You
          </h2>
          <Link
            href="/search"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {sidebarMode ? (
        <div className="space-y-3">
          {displayListings.map((listing) => {
             const sortedImages = (listing.images || [])
              .sort((a, b) => a.image_order - b.image_order)
              .map((img) => getImageUrl(img.r2_key, "card"));
             const image = sortedImages.length > 0 ? sortedImages[0] : "/placeholder-car.jpg";
             const formattedPrice = new Intl.NumberFormat("en-KE").format(listing.price);
             const title = getListingDisplayTitle(listing);
             const inCompare = isInCompare(listing.id);
             const compareLimitReached = !inCompare && ids.length >= maxItems;
             const isLiked = Boolean(likedIds[listing.id]);

             return (
              <div
                key={listing.id}
                className="group -mx-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                  <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                    <Link
                      href={`/vehicle/${listing.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={`View ${title}`}
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            if (!isLoaded || compareLimitReached) {
                              return;
                            }

                            toggleCompare(listing.id);
                          }}
                          disabled={!isLoaded || compareLimitReached}
                          aria-label={inCompare ? "Remove from compare" : "Add to compare"}
                          title={
                            compareLimitReached
                              ? `You can compare up to ${maxItems} vehicles`
                              : inCompare
                                ? "Remove from compare"
                                : "Add to compare"
                          }
                          className={cn(
                            "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm",
                            (!isLoaded || compareLimitReached) && "cursor-not-allowed opacity-60"
                          )}
                        >
                          {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setLikedIds((prev) => ({ ...prev, [listing.id]: !prev[listing.id] }));
                          }}
                          aria-label={isLiked ? "Remove from favorites" : "Save to favorites"}
                          className={cn(
                            "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-colors hover:text-red-500",
                            isLiked && "text-red-500"
                          )}
                        >
                          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <Link href={`/vehicle/${listing.id}`} className="min-w-0 flex-1 py-1">
                      <h4 className="line-clamp-2 text-xs font-semibold text-gray-900 transition-colors group-hover:text-primary">
                          {title}
                      </h4>
                      <p className="mt-1 text-xs font-bold text-primary">
                          {listing.currency} {formattedPrice}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {listing.dealer?.city || "Kenya"}
                      </p>
                  </Link>
              </div>
             )
          })}
           <Link
            href="/search"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            View all recommended
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayListings.map((listing) => {
            const sortedImages = (listing.images || [])
              .sort((a, b) => a.image_order - b.image_order)
              .map((img) => getImageUrl(img.r2_key, "card"));

            const sellerName =
              listing.dealer?.name ||
              listing.seller?.full_name ||
              "Private Seller";

            return (
              <CarCard
                key={listing.id}
                id={listing.id}
                title={getListingDisplayTitle(listing)}
                subtitle={getListingSubtitle(listing)}
                bodyType={listing.body_type || "Vehicle"}
                year={listing.year}
                mileage={listing.mileage ? `${listing.mileage.toLocaleString()} kms` : "N/A"}
                fuelType={listing.fuel_type || "N/A"}
                transmission={listing.transmission || "N/A"}
                price={listing.price}
                currency={listing.currency}
                images={sortedImages.length > 0 ? sortedImages : ["/placeholder-car.jpg"]}
                isFeatured={listing.is_featured}
                seller={{
                  name: sellerName,
                  avatarUrl: listing.dealer?.logo_url || listing.seller?.avatar_url || undefined,
                }}
                href={`/vehicle/${listing.id}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
