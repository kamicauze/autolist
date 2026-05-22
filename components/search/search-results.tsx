"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { Listing } from "@/lib/types/listing";
import { CarCard } from "@/components/ui/car-card";
import { Pagination } from "@/components/ui/pagination";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingDisplayTitle,
  getListingSubtitle,
} from "@/lib/utils/vehicle-display";
import { formatListingLabel } from "@/lib/utils/listing-details";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  listings: Listing[];
  total: number;
  totalPages: number;
  compact?: boolean;
}

export function SearchResults({ listings, totalPages, compact = false }: SearchResultsProps) {
  if (listings.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <SearchX className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No vehicles found</h3>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          We couldn&apos;t find any vehicles matching your filters. Try
          adjusting your search criteria.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid - 4 columns max on MacBook, 5 columns on large monitors */}
      <div
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3",
          compact ? "2xl:grid-cols-4" : "lg:grid-cols-4"
        )}
      >
        {listings.map((listing) => {
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
              bodyType={formatListingLabel(listing.body_type) || "Vehicle"}
              year={listing.year}
              mileage={listing.mileage ? `${listing.mileage.toLocaleString()} kms` : "N/A"}
              fuelType={formatListingLabel(listing.fuel_type) || "N/A"}
              transmission={formatListingLabel(listing.transmission) || "N/A"}
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

      {/* Pagination */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}
