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

export type CmsBannerPlacement = (typeof CMS_BANNER_PLACEMENTS)[number];
export type CmsBannerStatus = (typeof CMS_BANNER_STATUSES)[number];

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

export type CmsBannerRecord = {
  id: string;
  title: string;
  slug: string | null;
  placement: CmsBannerPlacement;
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
