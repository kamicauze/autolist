export type ListingImageVariant = "original" | "thumb" | "card" | "hero";

const LISTING_VARIANT_SEGMENTS: Record<Exclude<ListingImageVariant, "original">, string> = {
  thumb: "variants/thumb",
  card: "variants/card",
  hero: "variants/hero",
};

export function isListingImageKey(r2Key: string) {
  return r2Key.startsWith("listings/");
}

export function buildListingImageVariantKey(
  originalKey: string,
  variant: Exclude<ListingImageVariant, "original">
) {
  if (!isListingImageKey(originalKey)) {
    return originalKey;
  }

  if (originalKey.includes("/variants/")) {
    return originalKey;
  }

  const lastSlashIndex = originalKey.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return originalKey;
  }

  const directory = originalKey.slice(0, lastSlashIndex);
  const fileName = originalKey.slice(lastSlashIndex + 1);
  const baseName = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  return `${directory}/${LISTING_VARIANT_SEGMENTS[variant]}/${baseName}.webp`;
}
