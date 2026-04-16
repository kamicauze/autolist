
import type { ListingImageVariant } from "@/lib/utils/image-variants";

export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getImageUrl(
  r2Key: string,
  variant: ListingImageVariant = "original"
): string {
  if (!r2Key) return "/placeholder-car.jpg";
  if (r2Key.startsWith("http")) return r2Key;

  if (variant !== "original") {
    const params = new URLSearchParams({
      key: r2Key,
      variant,
    });
    return `/api/listing-image?${params.toString()}`;
  }

  return `${R2_PUBLIC_URL}/${r2Key}`;
}
