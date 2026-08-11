export type ListingMediaKind = "image" | "document" | "video";

export type ListingMediaUploadDescriptor = {
  clientId: string;
  kind: ListingMediaKind;
  name: string;
  size: number;
  contentType: string;
  lastModified: number;
};

export type ListingMediaUploadReference = ListingMediaUploadDescriptor & {
  key: string;
};

export type ListingMediaUploadTicket = ListingMediaUploadReference & {
  uploadUrl: string;
  expiresAt: string;
};

export const LISTING_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const LISTING_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const LISTING_VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const LISTING_IMAGE_MAX_COUNT = 100;
export const LISTING_DOCUMENT_MAX_COUNT = 20;

const IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const VIDEO_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

export function sanitizeListingMediaFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export function getListingMediaKeyPrefix(listingId: string, kind: ListingMediaKind) {
  return `listings/${listingId}/media/${kind}/`;
}

export function getListingMediaUploadKeyPrefix(listingId: string, kind: ListingMediaKind) {
  return `listings/${listingId}/uploads/${kind}/`;
}

export function buildListingMediaObjectKey(
  listingId: string,
  kind: ListingMediaKind,
  fingerprint: string,
  fileName: string
) {
  return `${getListingMediaKeyPrefix(listingId, kind)}${fingerprint}-${sanitizeListingMediaFileName(fileName)}`;
}

export function buildListingMediaUploadObjectKey(
  listingId: string,
  kind: ListingMediaKind,
  fingerprint: string,
  fileName: string
) {
  return `${getListingMediaUploadKeyPrefix(listingId, kind)}${fingerprint}-${sanitizeListingMediaFileName(fileName)}`;
}

export function isListingMediaKeyForListing(
  key: string,
  listingId: string,
  kind: ListingMediaKind
) {
  return key.startsWith(getListingMediaKeyPrefix(listingId, kind));
}

export function isListingMediaUploadKeyForListing(
  key: string,
  listingId: string,
  kind: ListingMediaKind
) {
  return key.startsWith(getListingMediaUploadKeyPrefix(listingId, kind));
}

export function isAcceptedListingMediaContentType(
  kind: ListingMediaKind,
  contentType: string
) {
  if (kind === "image") return IMAGE_CONTENT_TYPES.has(contentType);
  if (kind === "document") return DOCUMENT_CONTENT_TYPES.has(contentType);
  return VIDEO_CONTENT_TYPES.has(contentType);
}

export function getListingMediaMaxBytes(kind: ListingMediaKind) {
  if (kind === "image") return LISTING_IMAGE_MAX_BYTES;
  if (kind === "document") return LISTING_DOCUMENT_MAX_BYTES;
  return LISTING_VIDEO_MAX_BYTES;
}

export function validateListingMediaUploadDescriptors(
  descriptors: unknown
) {
  if (!Array.isArray(descriptors)) return "Media upload details are invalid.";
  if (descriptors.length === 0) return "Choose at least one media file to upload.";

  const counts: Record<ListingMediaKind, number> = {
    image: 0,
    document: 0,
    video: 0,
  };
  const clientIds = new Set<string>();
  const fileFingerprints = new Set<string>();

  for (const candidate of descriptors) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return "Media upload details are invalid.";
    }
    const descriptor = candidate as Partial<ListingMediaUploadDescriptor>;
    if (
      typeof descriptor.clientId !== "string" ||
      (descriptor.kind !== "image" && descriptor.kind !== "document" && descriptor.kind !== "video") ||
      typeof descriptor.name !== "string" ||
      typeof descriptor.size !== "number" ||
      typeof descriptor.contentType !== "string" ||
      typeof descriptor.lastModified !== "number"
    ) {
      return "Media upload details are invalid.";
    }
    const name = descriptor.name.trim();
    const clientId = descriptor.clientId.trim();
    if (!clientId || clientId.length > 100 || clientIds.has(clientId)) {
      return "Media upload identifiers are invalid.";
    }
    clientIds.add(clientId);

    if (!name || name.length > 255) return "A media filename is invalid.";
    if (!Number.isSafeInteger(descriptor.size) || descriptor.size <= 0) {
      return `"${name}" is empty or has an invalid size.`;
    }
    if (descriptor.size > getListingMediaMaxBytes(descriptor.kind)) {
      const limitMb = Math.round(getListingMediaMaxBytes(descriptor.kind) / (1024 * 1024));
      return `"${name}" exceeds the ${limitMb}MB upload limit.`;
    }
    if (!Number.isSafeInteger(descriptor.lastModified) || descriptor.lastModified < 0) {
      return `"${name}" has invalid file metadata.`;
    }
    if (!isAcceptedListingMediaContentType(descriptor.kind, descriptor.contentType)) {
      if (descriptor.kind === "image") return `"${name}" must be a JPG, PNG, or WebP image.`;
      if (descriptor.kind === "document") return `"${name}" must be a PDF, JPG, PNG, or WebP file.`;
      return `"${name}" must be an MP4, WEBM, or MOV video.`;
    }

    const fingerprint = [
      descriptor.kind,
      name,
      descriptor.size,
      descriptor.contentType,
      descriptor.lastModified,
    ].join("|");
    if (fileFingerprints.has(fingerprint)) {
      return `"${name}" was selected more than once.`;
    }
    fileFingerprints.add(fingerprint);
    counts[descriptor.kind] += 1;
  }

  if (counts.image > LISTING_IMAGE_MAX_COUNT) {
    return `Gallery supports up to ${LISTING_IMAGE_MAX_COUNT} images.`;
  }
  if (counts.document > LISTING_DOCUMENT_MAX_COUNT) {
    return `Upload up to ${LISTING_DOCUMENT_MAX_COUNT} documents at a time.`;
  }
  if (counts.video > 1) return "Upload one listing video at a time.";

  return null;
}

export function toListingMediaUploadReference(ticket: ListingMediaUploadTicket) {
  return {
    clientId: ticket.clientId,
    kind: ticket.kind,
    name: ticket.name,
    size: ticket.size,
    contentType: ticket.contentType,
    lastModified: ticket.lastModified,
    key: ticket.key,
  };
}
