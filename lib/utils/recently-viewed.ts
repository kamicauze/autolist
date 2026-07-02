const STORAGE_KEY = "autolist-recently-viewed";
const MAX_ITEMS = 12;

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === "string").slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(listingId: string) {
  if (typeof window === "undefined" || !listingId) {
    return;
  }

  try {
    const next = [listingId, ...getRecentlyViewedIds().filter((id) => id !== listingId)].slice(
      0,
      MAX_ITEMS
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode / blocked) — viewing history is best-effort.
  }
}
