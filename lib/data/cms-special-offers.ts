import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type {
  AdminCmsSpecialOffersData,
  CmsSpecialOffer,
  CmsSpecialOfferRecord,
} from "@/lib/types/cms-special-offers";

export const CMS_SPECIAL_OFFER_SELECT = [
  "id",
  "title",
  "audience",
  "description",
  "image_url",
  "target_url",
  "status",
  "starts_at",
  "ends_at",
  "redemption_count",
  "sort_order",
  "created_by",
  "created_at",
  "updated_at",
].join(", ");

const EMPTY_ADMIN_CMS_SPECIAL_OFFERS_DATA: AdminCmsSpecialOffersData = {
  schemaReady: false,
  offers: [],
  stats: {
    total: 0,
    live: 0,
    scheduled: 0,
    paused: 0,
    totalRedemptions: 0,
  },
};

function isLiveNow(record: Pick<CmsSpecialOfferRecord, "status" | "starts_at" | "ends_at">) {
  if (record.status !== "active") return false;

  const now = Date.now();
  const startsAt = record.starts_at ? new Date(record.starts_at).getTime() : null;
  const endsAt = record.ends_at ? new Date(record.ends_at).getTime() : null;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return true;
}

function isScheduled(record: Pick<CmsSpecialOfferRecord, "status" | "starts_at">) {
  return (
    record.status === "active" &&
    Boolean(record.starts_at) &&
    new Date(record.starts_at!).getTime() > Date.now()
  );
}

export function normalizeCmsSpecialOffer(record: CmsSpecialOfferRecord): CmsSpecialOffer {
  return {
    id: record.id,
    title: record.title,
    audience: record.audience,
    description: record.description,
    imageUrl: record.image_url,
    targetUrl: record.target_url,
    status: record.status,
    startsAt: record.starts_at,
    endsAt: record.ends_at,
    redemptionCount: record.redemption_count,
    sortOrder: record.sort_order,
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    isCurrentlyLive: isLiveNow(record),
  };
}

function calculateStats(records: CmsSpecialOfferRecord[]): AdminCmsSpecialOffersData["stats"] {
  return {
    total: records.length,
    live: records.filter(isLiveNow).length,
    scheduled: records.filter(isScheduled).length,
    paused: records.filter((offer) => offer.status === "paused").length,
    totalRedemptions: records.reduce((sum, offer) => sum + offer.redemption_count, 0),
  };
}

export async function getAdminCmsSpecialOffersData(): Promise<AdminCmsSpecialOffersData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cms_special_offers")
    .select(CMS_SPECIAL_OFFER_SELECT)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error)) {
      return EMPTY_ADMIN_CMS_SPECIAL_OFFERS_DATA;
    }

    console.error("Error fetching CMS special offers:", error);
    return EMPTY_ADMIN_CMS_SPECIAL_OFFERS_DATA;
  }

  const records = (data ?? []) as unknown as CmsSpecialOfferRecord[];

  return {
    schemaReady: true,
    offers: records.map(normalizeCmsSpecialOffer),
    stats: calculateStats(records),
  };
}

export const getActiveCmsSpecialOffers = cache(
  async (limit = 6): Promise<CmsSpecialOffer[]> => {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("cms_special_offers")
      .select(CMS_SPECIAL_OFFER_SELECT)
      .eq("status", "active")
      .neq("image_url", "")
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (!isMissingRelationError(error)) {
        console.error("Error fetching active CMS special offers:", error);
      }
      return [];
    }

    return ((data ?? []) as unknown as CmsSpecialOfferRecord[]).map(normalizeCmsSpecialOffer);
  }
);
