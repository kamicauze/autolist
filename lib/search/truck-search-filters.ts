type ListingWithMetadata = {
  metadata?: unknown;
};

export type TruckSearchFilters = {
  axleConfig?: string;
  cabType?: string;
  minGvmKg?: number;
  maxGvmKg?: number;
  minEnginePowerBhp?: number;
  maxEnginePowerBhp?: number;
};

function getMetadataString(listing: ListingWithMetadata, key: string) {
  const metadata =
    listing.metadata && typeof listing.metadata === "object"
      ? (listing.metadata as Record<string, unknown>)
      : {};
  const directValue = metadata[key];
  const details =
    metadata.details && typeof metadata.details === "object"
      ? (metadata.details as Record<string, unknown>)
      : {};
  const value = directValue ?? details[key];

  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

function normalizeExactValue(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function parseMetadataNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesExactMetadataValue(
  listing: ListingWithMetadata,
  key: string,
  requestedValue?: string
) {
  if (!requestedValue?.trim()) {
    return true;
  }

  const value = getMetadataString(listing, key);
  return value
    ? normalizeExactValue(value) === normalizeExactValue(requestedValue)
    : false;
}

function matchesMetadataRange(
  listing: ListingWithMetadata,
  key: string,
  min?: number,
  max?: number
) {
  if (min == null && max == null) {
    return true;
  }

  const value = parseMetadataNumber(getMetadataString(listing, key));
  if (value == null) {
    return false;
  }
  if (min != null && value < min) {
    return false;
  }
  if (max != null && value > max) {
    return false;
  }
  return true;
}

export function hasTruckSearchFilters(filters: TruckSearchFilters) {
  return Boolean(
    filters.axleConfig?.trim() ||
      filters.cabType?.trim() ||
      filters.minGvmKg != null ||
      filters.maxGvmKg != null ||
      filters.minEnginePowerBhp != null ||
      filters.maxEnginePowerBhp != null
  );
}

export function listingMatchesTruckSearchFilters(
  listing: ListingWithMetadata,
  filters: TruckSearchFilters
) {
  return (
    matchesExactMetadataValue(listing, "axleConfig", filters.axleConfig) &&
    matchesExactMetadataValue(listing, "cabType", filters.cabType) &&
    matchesMetadataRange(listing, "gvmKg", filters.minGvmKg, filters.maxGvmKg) &&
    matchesMetadataRange(
      listing,
      "enginePowerBhp",
      filters.minEnginePowerBhp,
      filters.maxEnginePowerBhp
    )
  );
}
