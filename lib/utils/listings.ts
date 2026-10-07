
import { buildListingImageVariantKey, type ListingImageVariant } from "@/lib/utils/image-variants";

export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getStorageObjectUrl(r2Key: string): string {
  if (!r2Key) return "";
  if (r2Key.startsWith("http")) return r2Key;
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${r2Key}` : r2Key;
}

export function getImageUrl(
  r2Key: string,
  variant: ListingImageVariant = "original"
): string {
  if (!r2Key) return "/placeholder-car.jpg";
  if (r2Key.startsWith("http")) return r2Key;

  // Finalized listing images always have every variant (rows are only written after the
  // variant uploads succeed), so link straight to R2 instead of via /api/listing-image.
  const key = variant === "original" ? r2Key : buildListingImageVariantKey(r2Key, variant);
  return getStorageObjectUrl(key) || "/placeholder-car.jpg";
}
