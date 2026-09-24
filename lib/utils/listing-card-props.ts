import type { CarCardProps } from "@/components/ui/car-card";
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

export function getListingCardProps(listing: Listing): CarCardProps {
  const images = [...(listing.images || [])]
    .sort((left, right) => left.image_order - right.image_order)
    .map((image) => getImageUrl(image.r2_key, "card"));

  return {
    id: listing.id,
    title: getListingDisplayTitle(listing),
    subtitle: getListingSubtitle(listing),
    bodyType: getListingBodyTypeLabel(listing),
    year: listing.year,
    mileage: getListingMileageLabel(listing) || undefined,
    fuelType: getListingFuelTypeLabel(listing) || undefined,
    transmission: getListingTransmissionLabel(listing) || undefined,
    engineSize: getListingEngineDisplacement(listing) || undefined,
    location: getListingDisplayLocation(listing),
    sellerLabel: listing.dealer ? `Dealer: ${listing.dealer.name}` : "Private seller",
    contactLabel: listing.dealer ? "Call Dealer" : "Send Message",
    contactKind: listing.dealer ? "call" : "message",
    price: listing.price,
    currency: listing.currency,
    images: images.length > 0 ? images : ["/placeholder-car.jpg"],
    isFeatured: listing.is_featured,
    seller: {
      name: listing.dealer?.name || listing.seller?.full_name || "Private Seller",
      avatarUrl: listing.dealer?.logo_url || listing.seller?.avatar_url || undefined,
    },
    href: `/vehicle/${listing.id}`,
  };
}
