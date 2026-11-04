import { isPrivateSearchPath, SITE_URL } from "./seo";

export const ANALYTICS_CONSENT_KEY = "autolist-analytics-consent";
export type AnalyticsConsent = "accepted" | "declined" | null;

export function getGoogleAnalyticsMeasurementId(
  environment = process.env.VERCEL_ENV,
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
) {
  return environment === "production" && /^G-[A-Z0-9]+$/.test(measurementId ?? "")
    ? measurementId!
    : null;
}

export function isAnalyticsPageAllowed(pathname: string, hostname: string) {
  if (hostname !== new URL(SITE_URL).hostname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return false;
  }
  const path = new URL(pathname, SITE_URL).pathname;
  return !isPrivateSearchPath(path) && !["/join", "/sell", "/alerts", "/recently-viewed"].some(
    (privatePath) => path === privatePath || path.startsWith(`${privatePath}/`)
  );
}

export function getAnalyticsPageLocation(pathname: string) {
  return `${SITE_URL}${new URL(pathname, SITE_URL).pathname}`;
}

export function getAnalyticsReferrer(referrer: string) {
  try {
    const url = new URL(referrer);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (url.origin !== SITE_URL) return url.origin;
    return isAnalyticsPageAllowed(url.pathname, url.hostname)
      ? getAnalyticsPageLocation(url.pathname)
      : "";
  } catch {
    return "";
  }
}
