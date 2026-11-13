import { isPublicAnalyticsPath } from "./google-analytics";
import { SITE_URL } from "./seo";

export const SITE_TRACK_ENDPOINT = "/api/track";
export const SITE_TRACK_EVENT = "autolist-site-track";
export const MAX_SITE_EVENTS_PER_REQUEST = 20;

export const SITE_CLICK_EVENTS = [
  "search_submit",
  "filter_apply",
  "listing_card_click",
  "dealer_profile_click",
  "compare_add",
  "whatsapp_click",
  "call_click",
  "enquiry_send",
  "financing_open",
  "viewing_open",
  "save_listing",
  "share_listing",
  "sell_cta_click",
  "signup_cta_click",
  "nav_click",
  "banner_click",
] as const;

export type SiteClickEvent = (typeof SITE_CLICK_EVENTS)[number];
export type SiteEventName = "page_view" | SiteClickEvent;
export type SiteTrackDetail = { name: SiteClickEvent; target?: string };

export const SITE_EVENT_LABELS: Record<SiteEventName, string> = {
  page_view: "Page views",
  search_submit: "Searches",
  filter_apply: "Filters applied",
  listing_card_click: "Listing card clicks",
  dealer_profile_click: "Dealer profile clicks",
  compare_add: "Added to compare",
  whatsapp_click: "WhatsApp clicks",
  call_click: "Call clicks",
  enquiry_send: "Enquiry send clicks",
  financing_open: "Financing opened",
  viewing_open: "Viewing request opened",
  save_listing: "Saved listings",
  share_listing: "Shared listings",
  sell_cta_click: "Sell your car clicks",
  signup_cta_click: "Sign-up clicks",
  nav_click: "Menu and footer links",
  banner_click: "Banner clicks",
};

export function isSiteClickEvent(value: unknown): value is SiteClickEvent {
  return typeof value === "string" && (SITE_CLICK_EVENTS as readonly string[]).includes(value);
}

export function getTrackedPath(pathname: string) {
  if (!isPublicAnalyticsPath(pathname)) return null;
  const path = new URL(pathname, SITE_URL).pathname;
  return path.length <= 200 ? path : null;
}

export function cleanTrackTarget(value: string | null | undefined) {
  const text = value?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 80) : undefined;
}

export function getExternalReferrerOrigin(referrer: string, siteHost: string) {
  try {
    const url = new URL(referrer);
    if (!["http:", "https:"].includes(url.protocol) || url.host === siteHost) return undefined;
    return url.origin.slice(0, 200);
  } catch {
    return undefined;
  }
}

export function isLikelyBot(userAgent: string) {
  return !userAgent || /bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(userAgent);
}

export function getDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|playbook|silk/i.test(userAgent) || (/android/i.test(userAgent) && !/mobi/i.test(userAgent))) {
    return "tablet";
  }
  return /mobi|iphone|ipod|android/i.test(userAgent) ? "mobile" : "desktop";
}
