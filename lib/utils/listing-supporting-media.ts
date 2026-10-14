import type { Listing } from "@/lib/types/listing";
import { getListingMetadataString } from "@/lib/utils/listing-details";
import { getStorageObjectUrl } from "@/lib/utils/listings";

function httpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export function getListingSupportingMedia(listing: Pick<Listing, "metadata">) {
  const metadata = listing.metadata ?? {};
  const videoUrl = httpUrl(getListingMetadataString(listing, "videoUrl"));
  const documents: { name: string; url: string | null }[] = [];

  if (Array.isArray(metadata.documents)) {
    for (const value of metadata.documents) {
      if (!value || typeof value !== "object") continue;
      const document = value as Record<string, unknown>;
      const name = [document.name, document.fileName, document.displayName]
        .find((candidate) => typeof candidate === "string" && candidate.trim());
      if (typeof name !== "string") continue;
      const key = typeof document.key === "string" ? document.key : document.r2_key;
      const url = httpUrl(document.url) ?? httpUrl(document.publicUrl)
        ?? (typeof key === "string" ? httpUrl(getStorageObjectUrl(key)) : null);
      if (!documents.some((existing) => existing.name === name.trim() && existing.url === url)) {
        documents.push({ name: name.trim(), url });
      }
    }
  }
  if (Array.isArray(metadata.documentNames)) {
    for (const value of metadata.documentNames) {
      if (typeof value !== "string" || !value.trim()) continue;
      const name = value.trim();
      if (!documents.some((document) => document.name === name)) {
        documents.push({ name, url: null });
      }
    }
  }
  return { videoUrl, documents };
}
