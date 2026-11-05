const legacySlugs = new Map([
  ["untitled-post", "hot-new-bmw-x5-is-here"],
  ["untitled-post-2", "the-ultimate-guide-to-essential-car-maintenance"],
  ["buying-brand-new-2", "the-real-benefits-of-buying-brand-new"],
]);

export function getPublicContentPostSlug(storedSlug: string) {
  return legacySlugs.get(storedSlug) ?? storedSlug;
}

export function getLegacyContentPostSlug(publicSlug: string) {
  return Array.from(legacySlugs).find(([, slug]) => slug === publicSlug)?.[0] ?? publicSlug;
}
