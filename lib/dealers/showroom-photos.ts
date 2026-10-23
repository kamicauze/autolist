export const MAX_SHOWROOM_PHOTOS = 5;
export const MAX_SHOWROOM_PHOTO_BYTES = 5 * 1024 * 1024;
export const SHOWROOM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isOwnedShowroomPhotoKey(key: unknown, ownerId: string): key is string {
  return typeof key === "string" &&
    key.startsWith(`dealers/${ownerId}/showroom/`) &&
    /^[a-zA-Z0-9/_-]+\.webp$/.test(key) &&
    !key.includes("..");
}

export function validateShowroomPhotoSelection(
  retained: unknown,
  current: string[],
  files: Array<{ size: number; type: string }>,
  ownerId: string,
): string | null {
  if (!Array.isArray(retained) ||
      retained.some((key) => !isOwnedShowroomPhotoKey(key, ownerId) || !current.includes(key)) ||
      new Set(retained).size !== retained.length) {
    return "Refresh the page before updating your dealership photos.";
  }
  if (retained.length + files.length > MAX_SHOWROOM_PHOTOS) {
    return `Choose up to ${MAX_SHOWROOM_PHOTOS} dealership photos.`;
  }
  if (files.some((file) => !SHOWROOM_PHOTO_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_SHOWROOM_PHOTO_BYTES)) {
    return "Each photo must be a JPG, PNG, or WebP image up to 5MB.";
  }
  return null;
}

export function orderShowroomCover(keys: string[], coverIndex: number): string[] {
  if (!Number.isInteger(coverIndex) || coverIndex < 0 || coverIndex >= Math.max(1, keys.length)) {
    throw new Error("Choose a valid dealership cover photo.");
  }
  return keys.length ? [keys[coverIndex], ...keys.filter((_, index) => index !== coverIndex)] : [];
}
