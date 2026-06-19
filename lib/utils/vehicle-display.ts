import type { Listing } from "@/lib/types/listing";
import { formatListingLabel, getListingMetadataString } from "@/lib/utils/listing-details";

export function getListingTrim(listing: Listing) {
  return getListingMetadataString(listing, "trim");
}

export function getListingVariant(listing: Listing) {
  return getListingMetadataString(listing, "variant");
}

export function getListingEngineDisplacement(listing: Listing) {
  return (
    getListingMetadataString(listing, "engineCapacity") ??
    getListingMetadataString(listing, "engine_capacity") ??
    getListingMetadataString(listing, "engineDisplacement") ??
    getListingMetadataString(listing, "engine_displacement") ??
    getListingMetadataString(listing, "engine_size")
  );
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
    getListingBodyTypeLabel(listing, ""),
    getListingDisplayLocation(listing, { fallback: "" }),
  ].filter(Boolean);

  return parts.join(" • ");
}

function formatMileageValue(value: number | string | null | undefined) {
  if (value == null) return "";

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? `${value.toLocaleString("en-KE")} km` : "";
  }

  const normalized = value.trim();
  if (!normalized) return "";

  const numeric = Number(normalized.replace(/,/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) {
    return `${numeric.toLocaleString("en-KE")} km`;
  }

  return normalized;
}

export function getListingMileageLabel(listing: Listing, fallback = "Mileage pending") {
  return (
    formatMileageValue(listing.mileage) ||
    formatMileageValue(getListingMetadataString(listing, "mileage")) ||
    fallback
  );
}

export function getListingFuelTypeLabel(listing: Listing, fallback = "Fuel pending") {
  return (
    formatListingLabel(
      listing.fuel_type ??
        getListingMetadataString(listing, "fuelType") ??
        getListingMetadataString(listing, "fuel_type") ??
        getListingMetadataString(listing, "engineType")
    ) || fallback
  );
}

export function getListingTransmissionLabel(listing: Listing, fallback = "Transmission pending") {
  return (
    formatListingLabel(
      listing.transmission ?? getListingMetadataString(listing, "transmission")
    ) || fallback
  );
}

export function getListingBodyTypeLabel(listing: Listing, fallback = "Vehicle") {
  const label = formatListingLabel(
    listing.body_type ??
      getListingMetadataString(listing, "bodyType") ??
      getListingMetadataString(listing, "body_type") ??
      getListingMetadataString(listing, "bodyStyle")
  );

  if (label.toLowerCase() === "suv") return "SUV";
  return label || fallback;
}
