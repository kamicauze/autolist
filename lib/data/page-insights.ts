import { createOptionalAdminClient } from "@/lib/supabase/admin";
import type { PageInsightsData, PageInsightsSeries } from "@/lib/types/page-insights";

const TIMEZONE = "Africa/Nairobi";
// Kenya has no DST, so EAT is a fixed UTC+3.
const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const TODAY_BUCKET_HOURS = 3;
const MONTH_DAYS = 30;
const WEEK_DAYS = 7;

type InsightRow = { bucket_start: string; views: number | string; leads: number | string };

function startOfNairobiDay(date: Date) {
  const shifted = date.getTime() + NAIROBI_OFFSET_MS;
  return new Date(shifted - (shifted % DAY_MS) - NAIROBI_OFFSET_MS);
}

function buildSeries(
  rows: InsightRow[],
  since: Date,
  bucketMs: number,
  bucketCount: number,
  formatLabel: (bucketStart: Date) => string
): PageInsightsSeries {
  const views = Array<number>(bucketCount).fill(0);
  const leads = Array<number>(bucketCount).fill(0);

  for (const row of rows) {
    const index = Math.round((new Date(row.bucket_start).getTime() - since.getTime()) / bucketMs);
    if (index < 0 || index >= bucketCount) continue;
    views[index] += Number(row.views);
    leads[index] += Number(row.leads);
  }

  return {
    labels: views.map((_, index) => formatLabel(new Date(since.getTime() + index * bucketMs))),
    views,
    leads,
    totalViews: views.reduce((sum, value) => sum + value, 0),
    totalLeads: leads.reduce((sum, value) => sum + value, 0),
  };
}

function sliceSeries(series: PageInsightsSeries, count: number): PageInsightsSeries {
  const views = series.views.slice(-count);
  const leads = series.leads.slice(-count);
  return {
    labels: series.labels.slice(-count),
    views,
    leads,
    totalViews: views.reduce((sum, value) => sum + value, 0),
    totalLeads: leads.reduce((sum, value) => sum + value, 0),
  };
}

const hourLabel = new Intl.DateTimeFormat("en-KE", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIMEZONE,
});
const dayLabel = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", timeZone: TIMEZONE });
const weekdayLabel = new Intl.DateTimeFormat("en-KE", { weekday: "short", timeZone: TIMEZONE });

// Views (listing_views) and leads (enquiries, viewing requests, offers) for
// listings the caller already resolved as theirs, e.g. via getMyListings().
export async function getSellerPageInsights(listingIds: string[]): Promise<PageInsightsData | null> {
  const adminSupabase = createOptionalAdminClient();
  if (!adminSupabase) return null;

  const todayStart = startOfNairobiDay(new Date());
  const monthStart = new Date(todayStart.getTime() - (MONTH_DAYS - 1) * DAY_MS);

  const [todayResult, monthResult] = listingIds.length
    ? await Promise.all([
        adminSupabase.rpc("get_listing_insight_series", {
          p_listing_ids: listingIds,
          p_since: todayStart.toISOString(),
          p_bucket: `${TODAY_BUCKET_HOURS} hours`,
        }),
        adminSupabase.rpc("get_listing_insight_series", {
          p_listing_ids: listingIds,
          p_since: monthStart.toISOString(),
          p_bucket: "1 day",
        }),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  if (todayResult.error || monthResult.error) {
    console.error("Page insights error:", todayResult.error?.message ?? monthResult.error?.message);
    return null;
  }

  const today = buildSeries(
    (todayResult.data ?? []) as InsightRow[],
    todayStart,
    TODAY_BUCKET_HOURS * HOUR_MS,
    24 / TODAY_BUCKET_HOURS,
    (bucketStart) => hourLabel.format(bucketStart)
  );
  const month = buildSeries(
    (monthResult.data ?? []) as InsightRow[],
    monthStart,
    DAY_MS,
    MONTH_DAYS,
    (bucketStart) => dayLabel.format(bucketStart)
  );
  const week = sliceSeries(month, WEEK_DAYS);
  week.labels = week.labels.map((_, index) =>
    weekdayLabel.format(new Date(todayStart.getTime() - (WEEK_DAYS - 1 - index) * DAY_MS))
  );

  return { today, week, month };
}
