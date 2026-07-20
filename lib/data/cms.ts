import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CMS_BLOCK_DEFINITIONS,
  CMS_BLOCK_KEYS,
  DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT,
  DEFAULT_HOME_HERO_CMS_CONTENT,
  DEFAULT_HOME_SECTIONS_CMS_CONTENT,
  type AdminHomepageCmsData,
  type CmsBlockContent,
  type CmsBlockKey,
  type CmsBlockRecord,
  type CmsBlockStatus,
  type HomepageCmsContent,
  type HomepageFeaturedListingsCmsContent,
  type HomepageHeroCmsContent,
  type HomepageHeroSlide,
  type HomepageSectionsCmsContent,
} from "@/lib/types/cms";

type CmsBlockRow = {
  id: string;
  block_key: string;
  label: string;
  description: string | null;
  draft_content: unknown;
  published_content: unknown;
  status: CmsBlockStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const CMS_BLOCK_SELECT = `
  id,
  block_key,
  label,
  description,
  draft_content,
  published_content,
  status,
  published_at,
  created_at,
  updated_at
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string, maxLength = 220) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  if (!normalized) return fallback;
  return normalized.slice(0, maxLength);
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readInteger(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.trunc(numeric), min), max);
}

function normalizeHeroSlide(
  value: unknown,
  index: number,
  fallbackImageUrl: string
): HomepageHeroSlide | null {
  const input = isRecord(value) ? value : {};
  const imageUrl = readString(input.imageUrl, index === 0 ? fallbackImageUrl : "", 500);

  if (!imageUrl) {
    return null;
  }

  return {
    id: readString(input.id, index === 0 ? "primary" : `slide-${index + 1}`, 80),
    imageUrl,
    altText: readString(input.altText, "Homepage hero banner", 180),
  };
}

function normalizeHeroContent(value: unknown): HomepageHeroCmsContent {
  const input = isRecord(value) ? value : {};
  const headline = readString(input.headline, DEFAULT_HOME_HERO_CMS_CONTENT.headline, 90);
  const subheading = readString(input.subheading, DEFAULT_HOME_HERO_CMS_CONTENT.subheading, 220);
  const backgroundImageUrl = readString(
    input.backgroundImageUrl,
    DEFAULT_HOME_HERO_CMS_CONTENT.backgroundImageUrl,
    500
  );
  const rawSlides = Array.isArray(input.slides) ? input.slides : [];
  const slides = rawSlides
    .map((slide, index) => normalizeHeroSlide(slide, index, backgroundImageUrl))
    .filter((slide): slide is HomepageHeroSlide => Boolean(slide));
  const primarySlide = slides[0] ?? {
    id: "primary",
    imageUrl: backgroundImageUrl,
    altText: headline,
  };

  return {
    headline,
    subheading,
    backgroundImageUrl: primarySlide.imageUrl,
    carouselEnabled: readBoolean(
      input.carouselEnabled,
      DEFAULT_HOME_HERO_CMS_CONTENT.carouselEnabled
    ),
    carouselIntervalSeconds: readInteger(
      input.carouselIntervalSeconds,
      DEFAULT_HOME_HERO_CMS_CONTENT.carouselIntervalSeconds,
      3,
      15
    ),
    slides: slides.length > 0 ? slides : [primarySlide],
    quickSearchEnabled: readBoolean(
      input.quickSearchEnabled,
      DEFAULT_HOME_HERO_CMS_CONTENT.quickSearchEnabled
    ),
  };
}

function normalizeFeaturedListingsContent(value: unknown): HomepageFeaturedListingsCmsContent {
  const input = isRecord(value) ? value : {};

  return {
    title: readString(input.title, DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.title, 90),
    viewAllLabel: readString(
      input.viewAllLabel,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.viewAllLabel,
      40
    ),
    featuredTabLabel: readString(
      input.featuredTabLabel,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.featuredTabLabel,
      40
    ),
    recentTabLabel: readString(
      input.recentTabLabel,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.recentTabLabel,
      40
    ),
    favoritesTabLabel: readString(
      input.favoritesTabLabel,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.favoritesTabLabel,
      40
    ),
    showTabs: readBoolean(input.showTabs, DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.showTabs),
    showFavoritesTab: readBoolean(
      input.showFavoritesTab,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.showFavoritesTab
    ),
    featuredLimit: readInteger(
      input.featuredLimit,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.featuredLimit,
      1,
      4
    ),
    recentLimit: readInteger(
      input.recentLimit,
      DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT.recentLimit,
      1,
      12
    ),
  };
}

function normalizeSectionsContent(value: unknown): HomepageSectionsCmsContent {
  const input = isRecord(value) ? value : {};

  return {
    showHowItWorks: readBoolean(input.showHowItWorks, DEFAULT_HOME_SECTIONS_CMS_CONTENT.showHowItWorks),
    showDiscoverMore: readBoolean(
      input.showDiscoverMore,
      DEFAULT_HOME_SECTIONS_CMS_CONTENT.showDiscoverMore
    ),
    showSellVehicle: readBoolean(input.showSellVehicle, DEFAULT_HOME_SECTIONS_CMS_CONTENT.showSellVehicle),
    showVideoReviews: readBoolean(
      input.showVideoReviews,
      DEFAULT_HOME_SECTIONS_CMS_CONTENT.showVideoReviews
    ),
    showServices: readBoolean(input.showServices, DEFAULT_HOME_SECTIONS_CMS_CONTENT.showServices),
    showNews: readBoolean(input.showNews, DEFAULT_HOME_SECTIONS_CMS_CONTENT.showNews),
    showBrandLogos: readBoolean(input.showBrandLogos, DEFAULT_HOME_SECTIONS_CMS_CONTENT.showBrandLogos),
    showSocialMedia: readBoolean(
      input.showSocialMedia,
      DEFAULT_HOME_SECTIONS_CMS_CONTENT.showSocialMedia
    ),
  };
}

export function normalizeCmsBlockContent(
  key: CmsBlockKey,
  value: unknown
): CmsBlockContent {
  switch (key) {
    case "home_hero":
      return normalizeHeroContent(value);
    case "home_featured_listings":
      return normalizeFeaturedListingsContent(value);
    case "home_sections":
      return normalizeSectionsContent(value);
  }
}

function serializeContent(value: CmsBlockContent | null) {
  return JSON.stringify(value ?? null);
}

function buildFallbackBlock(key: CmsBlockKey): CmsBlockRecord {
  const definition = CMS_BLOCK_DEFINITIONS[key];

  return {
    id: null,
    key,
    label: definition.label,
    description: definition.description,
    draftContent: definition.defaultContent,
    publishedContent: definition.defaultContent,
    status: "published",
    publishedAt: null,
    updatedAt: null,
    hasUnpublishedChanges: false,
  };
}

export function mapCmsBlockRow(row: CmsBlockRow): CmsBlockRecord | null {
  const key = row.block_key as CmsBlockKey;
  if (!(key in CMS_BLOCK_DEFINITIONS)) {
    return null;
  }

  const definition = CMS_BLOCK_DEFINITIONS[key];
  const draftContent = normalizeCmsBlockContent(key, row.draft_content);
  const publishedContent = row.published_content
    ? normalizeCmsBlockContent(key, row.published_content)
    : null;

  return {
    id: row.id,
    key,
    label: row.label || definition.label,
    description: row.description || definition.description,
    draftContent,
    publishedContent,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    hasUnpublishedChanges: serializeContent(draftContent) !== serializeContent(publishedContent),
  };
}

export async function getAdminHomepageCmsData(): Promise<AdminHomepageCmsData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_blocks")
    .select(CMS_BLOCK_SELECT)
    .in("block_key", [...CMS_BLOCK_KEYS])
    .order("block_key");

  if (isMissingRelationError(error)) {
    return {
      blocks: CMS_BLOCK_KEYS.map((key) => buildFallbackBlock(key)),
      schemaReady: false,
    };
  }

  if (error) {
    throw new Error(`Failed to load admin CMS blocks: ${error.message}`);
  }

  const blocksByKey = new Map<CmsBlockKey, CmsBlockRecord>();
  ((data ?? []) as CmsBlockRow[]).forEach((row) => {
    const block = mapCmsBlockRow(row);
    if (block) {
      blocksByKey.set(block.key, block);
    }
  });

  return {
    blocks: CMS_BLOCK_KEYS.map((key) => blocksByKey.get(key) ?? buildFallbackBlock(key)),
    schemaReady: true,
  };
}

export const getHomepageCmsContent = cache(async (): Promise<HomepageCmsContent> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_blocks")
    .select("block_key, published_content")
    .in("block_key", [...CMS_BLOCK_KEYS])
    .eq("status", "published");

  if (isMissingRelationError(error)) {
    return {
      hero: DEFAULT_HOME_HERO_CMS_CONTENT,
      featuredListings: DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT,
      sections: DEFAULT_HOME_SECTIONS_CMS_CONTENT,
    };
  }

  if (error) {
    console.error("Failed to load homepage CMS content:", error);
    return {
      hero: DEFAULT_HOME_HERO_CMS_CONTENT,
      featuredListings: DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT,
      sections: DEFAULT_HOME_SECTIONS_CMS_CONTENT,
    };
  }

  const contentByKey = new Map<string, unknown>(
    ((data ?? []) as Array<{ block_key: string; published_content: unknown }>).map((row) => [
      row.block_key,
      row.published_content,
    ])
  );

  return {
    hero: normalizeHeroContent(contentByKey.get("home_hero")),
    featuredListings: normalizeFeaturedListingsContent(
      contentByKey.get("home_featured_listings")
    ),
    sections: normalizeSectionsContent(contentByKey.get("home_sections")),
  };
});
