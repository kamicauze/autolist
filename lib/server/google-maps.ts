import "server-only";

const GOOGLE_MAPS_ENV_KEYS = [
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "G-MAPS",
] as const;

export function getGoogleMapsApiKey() {
  for (const key of GOOGLE_MAPS_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}
