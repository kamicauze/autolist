import type { Listing } from "@/lib/types/listing";

type ListingMetadataRecord = Record<string, unknown>;
type ListingDetailMap = Record<string, string>;

function getMetadataRecord(metadata: Listing["metadata"]): ListingMetadataRecord {
  return metadata && typeof metadata === "object" ? (metadata as ListingMetadataRecord) : {};
}

export function getListingMetadataDetails(listing: Pick<Listing, "metadata">): ListingDetailMap {
  const metadata = getMetadataRecord(listing.metadata);
  const nested =
    metadata.details && typeof metadata.details === "object"
      ? (metadata.details as Record<string, unknown>)
      : {};

  const normalized: ListingDetailMap = {};

  for (const [key, value] of Object.entries(nested)) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) {
      normalized[key] = text;
    }
  }

  return normalized;
}

export function getListingMetadataString(
  listing: Pick<Listing, "metadata">,
  key: string
): string | null {
  const metadata = getMetadataRecord(listing.metadata);
  const direct = metadata[key];

  if (direct != null) {
    const normalized = String(direct).trim();
    if (normalized) return normalized;
  }

  const details = getListingMetadataDetails(listing);
  const nested = details[key];
  return nested?.trim() ? nested : null;
}

export function getListingMetadataBoolean(
  listing: Pick<Listing, "metadata">,
  key: string
): boolean | null {
  const metadata = getMetadataRecord(listing.metadata);
  const direct = metadata[key];

  if (typeof direct === "boolean") {
    return direct;
  }

  if (typeof direct === "string") {
    const normalized = direct.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return null;
}

export function buildListingDetailMetadata(details: Record<string, string | null | undefined>) {
  const cleanedEntries = Object.entries(details)
    .map(([key, value]) => [key, value == null ? "" : String(value).trim()] as const)
    .filter(([, value]) => value.length > 0);

  return Object.fromEntries(cleanedEntries);
}

export function formatListingLabel(value: string | null | undefined) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalized) return "";

  return normalized.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function formatListingCondition(value: string | null | undefined) {
  if (value === "new") return "Brand new";
  if (value === "locally_used" || value === "used") return "Locally used";
  if (value === "foreign_used") return "Foreign used";
  return formatListingLabel(value) || "N/A";
}

export function formatListingRegistrationStatus(value: string | null | undefined) {
  if (value === "registered") return "Registered";
  if (value === "not_registered") return "Not registered";
  return "N/A";
}
