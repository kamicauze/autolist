export const ANON_VEHICLE_VIEWS_COOKIE = "autolist_anon_vehicle_views";
export const ANON_VEHICLE_VIEW_LIMIT = 7;
export const ANON_VEHICLE_VIEWS_MAX_AGE = 60 * 60 * 24 * 180;

export function readAnonymousVehicleViews(value: string | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .slice(-ANON_VEHICLE_VIEW_LIMIT);
  } catch {
    return [];
  }
}

export function writeAnonymousVehicleViews(ids: string[]) {
  return JSON.stringify(Array.from(new Set(ids)).slice(-ANON_VEHICLE_VIEW_LIMIT));
}

export function getAnonymousVehicleViewDecision(existingIds: string[], listingId: string) {
  if (existingIds.includes(listingId)) {
    return { allowed: true, ids: existingIds, changed: false };
  }

  if (existingIds.length >= ANON_VEHICLE_VIEW_LIMIT) {
    return { allowed: false, ids: existingIds, changed: false };
  }

  return { allowed: true, ids: [...existingIds, listingId], changed: true };
}
