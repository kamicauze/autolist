import type { Listing } from "@/lib/types/listing";
import { getListingMetadataString } from "@/lib/utils/listing-details";

export function getListingTrim(listing: Listing) {
  return getListingMetadataString(listing, "trim");
}

export function getListingVariant(listing: Listing) {
  return getListingMetadataString(listing, "variant");
}

export function getListingDisplayTitle(listing: Listing) {
  const trimValue = getListingTrim(listing);
  const parts = [
    String(listing.year),
    listing.make,
    listing.model,
    trimValue,
    trimValue ? null : getListingVariant(listing),
  ].filter(Boolean);

  return parts.join(" ");
}

type ListingLocationSource = {
  metadata: Listing["metadata"];
  dealer?: {
    city?: string | null;
  } | null;
};

export function getListingDisplayLocation(
  listing: ListingLocationSource,
  options?: { fallback?: string }
) {
  const cityTown =
    getListingMetadataString(listing, "cityTown") ??
    listing.dealer?.city?.trim() ??
    null;
  const locationArea = getListingMetadataString(listing, "locationArea");
  const parts = [locationArea, cityTown].filter(Boolean);

  if (parts.length > 0) {
    return Array.from(new Set(parts)).join(", ");
  }

  return options?.fallback ?? "Kenya";
}

export function getListingSubtitle(listing: Listing) {
  const parts = [
    getListingVariant(listing),
    getListingMetadataString(listing, "bodyType") ?? getListingMetadataString(listing, "body_type") ?? listing.body_type,
    getListingDisplayLocation(listing, { fallback: "" }),
  ].filter(Boolean);

  return parts.join(" • ");
}
