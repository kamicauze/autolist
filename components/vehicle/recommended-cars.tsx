"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Listing } from "@/lib/types/listing";
import { CarCard } from "@/components/ui/car-card";
import { getImageUrl } from "@/lib/utils/listings";
import { cn } from "@/lib/utils";

interface RecommendedCarsProps {
  listings: Listing[];
  sidebarMode?: boolean;
}

export function RecommendedCars({ listings, sidebarMode = false }: RecommendedCarsProps) {
  if (listings.length === 0) return null;

  const displayListings = sidebarMode ? listings.slice(0, 3) : listings;

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
        <div className="space-y-4">
          {displayListings.map((listing) => {
             const sortedImages = (listing.images || [])
              .sort((a, b) => a.image_order - b.image_order)
              .map((img) => getImageUrl(img.r2_key));
             const image = sortedImages.length > 0 ? sortedImages[0] : "/placeholder-car.jpg";
             const formattedPrice = new Intl.NumberFormat("en-KE").format(listing.price);

             return (
              <Link 
                key={listing.id} 
                href={`/vehicle/${listing.id}`}
                className="flex items-start gap-4 group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
              >
                  <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={`${listing.year} ${listing.make} ${listing.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                          {listing.year} {listing.make} {listing.model}
                      </h4>
                      <p className="mt-1 text-sm font-bold text-primary">
                          {listing.currency} {formattedPrice}
                      </p>
                  </div>
              </Link>
             )
          })}
           <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 mt-2"
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
      )}
    </div>
  );
}
