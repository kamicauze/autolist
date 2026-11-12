export const LISTING_DRAFT_STORAGE_PREFIX = "autolist_listing_draft";

type DraftStorage = Pick<Storage, "length" | "key" | "removeItem">;

function getBrowserStorage(): DraftStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

// Listing drafts can hold another account's vehicle details, so sign-out removes
// every draft key. Storage failures must never block signing out.
export function clearAccountStorage(storage: DraftStorage | null = null) {
  try {
    const target = storage ?? getBrowserStorage();
    if (!target) return;

    const draftKeys: string[] = [];
    for (let index = 0; index < target.length; index += 1) {
      const key = target.key(index);
      if (key?.startsWith(LISTING_DRAFT_STORAGE_PREFIX)) draftKeys.push(key);
    }
    for (const key of draftKeys) target.removeItem(key);
  } catch {
    // Storage can be unavailable (blocked site data, private mode).
  }
}
