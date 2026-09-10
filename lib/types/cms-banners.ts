import type { ListingCategory } from "@/lib/constants/marketplace";

export const CMS_BANNER_PLACEMENTS = [
  "home_hero",
  "home_top",
  "home_featured",
  "listing_global_top",
  "search_top",
  "search_sidebar",
  "vehicle_detail",
  "dashboard",
  "ad_detail_hero",
  "ad_detail_sidebar",
] as const;

export const CMS_BANNER_STATUSES = ["draft", "active", "paused"] as const;
export const CMS_BANNER_CATEGORY_TARGETS = [
  "cars_vans",
  "motorbike",
  "truck",
  "plant_construction",
  "farm_agricultural",
] as const;

export type CmsBannerPlacement = (typeof CMS_BANNER_PLACEMENTS)[number];
export type CmsBannerStatus = (typeof CMS_BANNER_STATUSES)[number];
export type CmsBannerCategoryTarget = (typeof CMS_BANNER_CATEGORY_TARGETS)[number];

export const CMS_BANNER_PLACEMENT_LABELS: Record<CmsBannerPlacement, string> = {
  home_hero: "Home / Hero",
  home_top: "Home / Top",
  home_featured: "Home / Featured rail",
  listing_global_top: "Listings / Global top",
  search_top: "Search / Top",
  search_sidebar: "Search / Sidebar stack",
  vehicle_detail: "Vehicle detail / Sidebar stack",
  dashboard: "Dashboard / Sidebar stack",
  ad_detail_hero: "Ad detail / Hero",
  ad_detail_sidebar: "Ad detail / Sidebar",
};

export const CMS_BANNER_CATEGORY_TARGET_LABELS: Record<CmsBannerCategoryTarget, string> = {
  cars_vans: "Cars & vans",
  motorbike: "Motorbikes",
  truck: "Trucks",
  plant_construction: "Plant",
  farm_agricultural: "Farm",
};

export function getCmsBannerCategoryTargetForListingCategory(
  category: ListingCategory | null | undefined
): CmsBannerCategoryTarget | null {
  if (category === "car" || category === "van") return "cars_vans";
  if (
    category === "motorbike" ||
    category === "truck" ||
    category === "plant_construction" ||
    category === "farm_agricultural"
  ) {
    return category;
  }

  return null;
}

export function normalizeCmsBannerCategoryTargets(
  value: unknown
): CmsBannerCategoryTarget[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is CmsBannerCategoryTarget =>
    CMS_BANNER_CATEGORY_TARGETS.includes(item as CmsBannerCategoryTarget)
  );
}

export function cmsBannerMatchesCategoryTarget(
  bannerTargets: readonly CmsBannerCategoryTarget[] | null | undefined,
  activeTarget: CmsBannerCategoryTarget | null | undefined
) {
  if (!bannerTargets || bannerTargets.length === 0) return true;
  if (!activeTarget) return false;
  return bannerTargets.includes(activeTarget);
}

export type CmsBannerRecord = {
  id: string;
  title: string;
  slug: string | null;
  placement: CmsBannerPlacement;
  category_targets?: CmsBannerCategoryTarget[] | null;
  status: CmsBannerStatus;
  desktop_image_url: string;
  mobile_image_url: string | null;
  alt_text: string | null;
  summary: string | null;
  body: string | null;
  cta_label: string | null;
  target_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  impression_count: number;
  click_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsBanner = {
  id: string;
  title: string;
  slug: string | null;
  placement: CmsBannerPlacement;
  categoryTargets: CmsBannerCategoryTarget[];
  status: CmsBannerStatus;
  desktopImageUrl: string;
  mobileImageUrl: string | null;
  altText: string | null;
  summary: string | null;
  body: string | null;
  ctaLabel: string | null;
  targetUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  impressionCount: number;
  clickCount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrentlyLive: boolean;
};

export type AdminCmsBannersData = {
  schemaReady: boolean;
  banners: CmsBanner[];
  stats: {
    total: number;
    live: number;
    scheduled: number;
    expiringSoon: number;
    averageCtr: number;
  };
};

export type SaveCmsBannerInput = {
  bannerId: string;
  title: string;
  slug: string;
  placement: CmsBannerPlacement;
  categoryTargets: CmsBannerCategoryTarget[];
  status: CmsBannerStatus;
  desktopImageUrl: string;
  mobileImageUrl: string;
  altText: string;
  summary: string;
  body: string;
  ctaLabel: string;
  targetUrl: string;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
};

export type CmsBannerMutationResult =
  | {
      success: true;
      banner: CmsBanner;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export type DeleteCmsBannerResult =
  | {
      success: true;
      bannerId: string;
      message: string;
    }
  | {
      success: false;
      error: string;
    };
