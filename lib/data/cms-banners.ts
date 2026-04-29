import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type {
  AdminCmsBannersData,
  CmsBanner,
  CmsBannerPlacement,
  CmsBannerRecord,
} from "@/lib/types/cms-banners";

export const CMS_BANNER_SELECT = [
  "id",
  "title",
  "placement",
  "status",
  "desktop_image_url",
  "mobile_image_url",
  "alt_text",
  "target_url",
  "starts_at",
  "ends_at",
  "sort_order",
  "impression_count",
  "click_count",
  "created_by",
  "created_at",
  "updated_at",
].join(", ");

const EMPTY_ADMIN_CMS_BANNERS_DATA: AdminCmsBannersData = {
  schemaReady: false,
  banners: [],
  stats: {
    total: 0,
    live: 0,
    scheduled: 0,
    expiringSoon: 0,
    averageCtr: 0,
  },
};

function isLiveNow(record: Pick<CmsBannerRecord, "status" | "starts_at" | "ends_at">) {
  if (record.status !== "active") return false;

  const now = Date.now();
  const startsAt = record.starts_at ? new Date(record.starts_at).getTime() : null;
  const endsAt = record.ends_at ? new Date(record.ends_at).getTime() : null;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return true;
}

function isScheduled(record: Pick<CmsBannerRecord, "status" | "starts_at">) {
  return record.status === "active" && Boolean(record.starts_at) && new Date(record.starts_at!).getTime() > Date.now();
}

function isExpiringSoon(record: Pick<CmsBannerRecord, "status" | "ends_at">) {
  if (record.status !== "active" || !record.ends_at) return false;

  const endsAt = new Date(record.ends_at).getTime();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return endsAt >= now && endsAt <= now + sevenDays;
}

export function normalizeCmsBanner(record: CmsBannerRecord): CmsBanner {
  return {
    id: record.id,
    title: record.title,
    placement: record.placement,
    status: record.status,
    desktopImageUrl: record.desktop_image_url,
    mobileImageUrl: record.mobile_image_url,
    altText: record.alt_text,
    targetUrl: record.target_url,
    startsAt: record.starts_at,
    endsAt: record.ends_at,
    sortOrder: record.sort_order,
    impressionCount: record.impression_count,
    clickCount: record.click_count,
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    isCurrentlyLive: isLiveNow(record),
  };
}

function calculateStats(records: CmsBannerRecord[]): AdminCmsBannersData["stats"] {
  const impressions = records.reduce((sum, item) => sum + item.impression_count, 0);
  const clicks = records.reduce((sum, item) => sum + item.click_count, 0);

  return {
    total: records.length,
    live: records.filter(isLiveNow).length,
    scheduled: records.filter(isScheduled).length,
    expiringSoon: records.filter(isExpiringSoon).length,
    averageCtr: impressions > 0 ? (clicks / impressions) * 100 : 0,
  };
}

export async function getAdminCmsBannersData(): Promise<AdminCmsBannersData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cms_banners")
    .select(CMS_BANNER_SELECT)
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error)) {
      return EMPTY_ADMIN_CMS_BANNERS_DATA;
    }

    console.error("Error fetching CMS banners:", error);
    return EMPTY_ADMIN_CMS_BANNERS_DATA;
  }

  const records = (data ?? []) as unknown as CmsBannerRecord[];

  return {
    schemaReady: true,
    banners: records.map(normalizeCmsBanner),
    stats: calculateStats(records),
  };
}

export const getActiveCmsBanners = cache(
  async (placement?: CmsBannerPlacement, limit = 6): Promise<CmsBanner[]> => {
    const supabase = await createClient();
    const now = new Date().toISOString();
    let query = supabase
      .from("cms_banners")
      .select(CMS_BANNER_SELECT)
      .eq("status", "active")
      .neq("desktop_image_url", "")
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (placement) {
      query = query.eq("placement", placement);
    }

    const { data, error } = await query;

    if (error) {
      if (!isMissingRelationError(error)) {
        console.error("Error fetching active CMS banners:", error);
      }
      return [];
    }

    return ((data ?? []) as unknown as CmsBannerRecord[]).map(normalizeCmsBanner);
  }
);
