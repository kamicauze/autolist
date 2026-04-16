import type { Listing } from "@/lib/types/listing";

function readMetadataString(metadata: Listing["metadata"], key: string) {
  const value = metadata && key in metadata ? metadata[key] : null;
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

export function getListingTrim(listing: Listing) {
  return readMetadataString(listing.metadata, "trim");
}

export function getListingVariant(listing: Listing) {
  return readMetadataString(listing.metadata, "variant");
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
    listing.body_type,
  ].filter(Boolean);

  return parts.join(" • ");
}
