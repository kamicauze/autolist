import Link from "next/link";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/types/listing";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingBodyTypeLabel,
  getListingDisplayLocation,
  getListingDisplayTitle,
  getListingEngineDisplacement,
  getListingFuelTypeLabel,
  getListingMileageLabel,
  getListingSubtitle,
  getListingTransmissionLabel,
} from "@/lib/utils/vehicle-display";

export function ListingsGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return <EmptyState message="No listings available at the moment." />;
  }

  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
      {listings.map((listing) => {
        const sortedImages = (listing.images || [])
          .sort((a, b) => a.image_order - b.image_order)
          .map((img) => getImageUrl(img.r2_key, "card"));

        const sellerName =
          listing.dealer?.name ||
          listing.seller?.full_name ||
          "Private Seller";

        return (
          <div key={listing.id} className="w-[82vw] max-w-full shrink-0 snap-start sm:w-auto">
            <CarCard
              id={listing.id}
              title={getListingDisplayTitle(listing)}
              subtitle={getListingSubtitle(listing)}
              bodyType={getListingBodyTypeLabel(listing)}
              year={listing.year}
              mileage={getListingMileageLabel(listing) || undefined}
              fuelType={getListingFuelTypeLabel(listing) || undefined}
              transmission={getListingTransmissionLabel(listing) || undefined}
              engineSize={getListingEngineDisplacement(listing) || undefined}
              location={getListingDisplayLocation(listing)}
              sellerLabel={listing.dealer ? "Dealer" : "Seller"}
              contactLabel={listing.dealer ? "Call Dealer" : "Send Message"}
              contactKind={listing.dealer ? "call" : "message"}
              price={listing.price}
              currency={listing.currency}
              images={
                sortedImages.length > 0 ? sortedImages : ["/placeholder-car.jpg"]
              }
              isFeatured={listing.is_featured}
              seller={{
                name: sellerName,
                avatarUrl:
                  listing.dealer?.logo_url ||
                  listing.seller?.avatar_url ||
                  undefined,
              }}
              href={`/vehicle/${listing.id}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <p className="text-muted-foreground">{message}</p>
      <Link href="/search" className="mt-4">
        <Button>Browse Vehicles</Button>
      </Link>
    </div>
  );
}
