import type { Listing } from "@/lib/types/listing";
import { getListingMetadataString } from "@/lib/utils/listing-details";

export function getListingTrim(listing: Listing) {
  return getListingMetadataString(listing, "trim");
}

export function getListingVariant(listing: Listing) {
  return getListingMetadataString(listing, "variant");
}

export function getListingDisplayTitle(listing: Listing) {
  const parts = [
    String(listing.year),
    listing.make,
    listing.model,
    getListingTrim(listing),
  ].filter(Boolean);

  return parts.join(" ");
}

export function getListingSubtitle(listing: Listing) {
  const parts = [
    getListingVariant(listing),
    getListingMetadataString(listing, "bodyType") ?? getListingMetadataString(listing, "body_type") ?? listing.body_type,
  ].filter(Boolean);

  return parts.join(" • ");
}
