export const HOMEPAGE_FEATURED_LISTING_LIMIT = 4;
export const HOMEPAGE_FEATURED_ROTATION_POOL_LIMIT = 40;
export const FEATURED_ROTATION_WINDOW_MS = 8 * 60 * 60 * 1000;

export function getRotatedFeaturedListings<T>(
  listings: readonly T[],
  requestedCount = HOMEPAGE_FEATURED_LISTING_LIMIT,
  now = Date.now(),
): T[] {
  const count = Math.min(
    Math.max(Math.trunc(requestedCount) || 1, 1),
    HOMEPAGE_FEATURED_LISTING_LIMIT,
  );

  if (listings.length <= count) return [...listings];

  const rotationWindow = Math.floor(now / FEATURED_ROTATION_WINDOW_MS);
  const startIndex = (rotationWindow * count) % listings.length;

  return Array.from(
    { length: count },
    (_, offset) => listings[(startIndex + offset) % listings.length],
  );
}
