import { cache } from "react";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { SITE_EVENT_LABELS, type SiteEventName } from "@/lib/site-analytics";

export type SiteTrafficCounts = { pageViews: number; visitors: number; visits: number; clicks: number };
export type SiteTrafficPeriod = SiteTrafficCounts & { days: number };
export type SiteTrafficDay = SiteTrafficCounts & { day: string; label: string };
export type SiteTrafficTopItem = { label: string; total: number; visitors: number };
export type SiteTrafficData = {
  available: boolean;
  totals: SiteTrafficPeriod[];
  daily: SiteTrafficDay[];
  topPages: SiteTrafficTopItem[];
  topClicks: SiteTrafficTopItem[];
};

const EMPTY_SITE_TRAFFIC: SiteTrafficData = { available: false, totals: [], daily: [], topPages: [], topClicks: [] };
const dayLabel = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", timeZone: "UTC" });

function rows(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object") : [];
}

function count(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function counts(row: Record<string, unknown>): SiteTrafficCounts {
  return { pageViews: count(row.page_views), visitors: count(row.visitors), visits: count(row.visits), clicks: count(row.clicks) };
}

function topItems(value: unknown, label: (raw: string) => string) {
  return rows(value).map((row) => ({ label: label(String(row.label ?? "")), total: count(row.total), visitors: count(row.visitors) }));
}

export function parseSiteTrafficSummary(value: unknown): Omit<SiteTrafficData, "available"> {
  const summary = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    totals: rows(summary.totals).map((row) => ({ days: count(row.days), ...counts(row) })),
    daily: rows(summary.daily).flatMap((row) => {
      const day = String(row.day ?? "");
      const date = new Date(`${day}T00:00:00Z`);
      return Number.isNaN(date.getTime()) ? [] : [{ day, label: dayLabel.format(date), ...counts(row) }];
    }),
    topPages: topItems(summary.top_pages, (path) => path),
    topClicks: topItems(summary.top_clicks, (name) => SITE_EVENT_LABELS[name as SiteEventName] ?? name),
  };
}

export const getSiteTrafficData = cache(async (): Promise<SiteTrafficData> => {
  const admin = createOptionalAdminClient();
  if (!admin) return EMPTY_SITE_TRAFFIC;
  const { data, error } = await admin.rpc("get_site_traffic_summary", { p_days: 30, p_limit: 10 });
  if (error) {
    console.error("Site traffic summary failed:", error.message);
    return EMPTY_SITE_TRAFFIC;
  }
  return { available: true, ...parseSiteTrafficSummary(data) };
});
