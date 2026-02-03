"use client";

import { Listing } from "@/lib/types/listing";
import { CarCard } from "@/components/ui/car-card";
import { Pagination } from "@/components/ui/pagination";
import { getImageUrl } from "@/lib/utils/listings";

interface SearchResultsProps {
  listings: Listing[];
  total: number;
  totalPages: number;
}

export function SearchResults({ listings, totalPages }: SearchResultsProps) {
  if (listings.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">No vehicles found</h3>
        <p className="mt-2 text-gray-500">
          Try adjusting your search criteria or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid - 4 columns max on MacBook, 5 columns on large monitors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => {
          const sortedImages = (listing.images || [])
            .sort((a, b) => a.image_order - b.image_order)
            .map((img) => getImageUrl(img.r2_key));

          const sellerName =
            listing.dealer?.name ||
            listing.seller?.full_name ||
            "Private Seller";

          return (
            <CarCard
              key={listing.id}
              id={listing.id}
              title={`${listing.year} ${listing.make} ${listing.model}`}
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

      {/* Pagination */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}
