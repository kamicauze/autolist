export const CMS_BLOCK_KEYS = [
  "home_hero",
  "home_featured_listings",
  "home_sections",
] as const;

export const CMS_BLOCK_STATUSES = ["draft", "published"] as const;

export type CmsBlockKey = (typeof CMS_BLOCK_KEYS)[number];
export type CmsBlockStatus = (typeof CMS_BLOCK_STATUSES)[number];

export type HomepageHeroSlide = {
  id: string;
  imageUrl: string;
  altText: string;
};

export type HomepageHeroCmsContent = {
  headline: string;
  subheading: string;
  backgroundImageUrl: string;
  carouselEnabled: boolean;
  carouselIntervalSeconds: number;
  slides: HomepageHeroSlide[];
  quickSearchEnabled: boolean;
};

export type HomepageFeaturedListingsCmsContent = {
  title: string;
  viewAllLabel: string;
  featuredTabLabel: string;
  recentTabLabel: string;
  favoritesTabLabel: string;
  showTabs: boolean;
  showFavoritesTab: boolean;
  featuredLimit: number;
  recentLimit: number;
};

export type HomepageSectionsCmsContent = {
  showHowItWorks: boolean;
  showDiscoverMore: boolean;
  showSellVehicle: boolean;
  showVideoReviews: boolean;
  showServices: boolean;
  showNews: boolean;
  showBrandLogos: boolean;
  showSocialMedia: boolean;
};

export type CmsBlockContent =
  | HomepageHeroCmsContent
  | HomepageFeaturedListingsCmsContent
  | HomepageSectionsCmsContent;

export type CmsBlockRecord = {
  id: string | null;
  key: CmsBlockKey;
  label: string;
  description: string;
  draftContent: CmsBlockContent;
  publishedContent: CmsBlockContent | null;
  status: CmsBlockStatus;
  publishedAt: string | null;
  updatedAt: string | null;
  hasUnpublishedChanges: boolean;
};

export type AdminHomepageCmsData = {
  blocks: CmsBlockRecord[];
  schemaReady: boolean;
};

export type HomepageCmsContent = {
  hero: HomepageHeroCmsContent;
  featuredListings: HomepageFeaturedListingsCmsContent;
  sections: HomepageSectionsCmsContent;
};

export type SaveCmsBlockInput = {
  blockKey: CmsBlockKey;
  content: CmsBlockContent;
  publish: boolean;
};

export type SaveCmsBlockResult =
  | {
      success: true;
      block: CmsBlockRecord;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export const DEFAULT_HOME_HERO_CMS_CONTENT: HomepageHeroCmsContent = {
  headline: "Find your perfect vehicle.",
  subheading:
    "Search cars, vans, bikes, trucks, plant and farm equipment from one marketplace.",
  backgroundImageUrl: "/hero-car.jpg",
  carouselEnabled: false,
  carouselIntervalSeconds: 6,
  slides: [
    {
      id: "primary",
      imageUrl: "/hero-car.jpg",
      altText: "Vehicle marketplace hero banner",
    },
  ],
  quickSearchEnabled: true,
};

export const DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT: HomepageFeaturedListingsCmsContent = {
  title: "Your recent activities",
  viewAllLabel: "View all",
  featuredTabLabel: "Recently viewed",
  recentTabLabel: "Recently added",
  favoritesTabLabel: "Favourites",
  showTabs: true,
  showFavoritesTab: true,
  featuredLimit: 4,
  recentLimit: 4,
};

export const DEFAULT_HOME_SECTIONS_CMS_CONTENT: HomepageSectionsCmsContent = {
  showHowItWorks: true,
  showDiscoverMore: true,
  showSellVehicle: true,
  showVideoReviews: true,
  showServices: true,
  showNews: true,
  showBrandLogos: true,
  showSocialMedia: true,
};

export const CMS_BLOCK_DEFINITIONS: Record<
  CmsBlockKey,
  {
    key: CmsBlockKey;
    label: string;
    description: string;
    defaultContent: CmsBlockContent;
  }
> = {
  home_hero: {
    key: "home_hero",
    label: "Homepage hero",
    description: "Main landing banner copy, high-definition image, carousel, and quick-search visibility.",
    defaultContent: DEFAULT_HOME_HERO_CMS_CONTENT,
  },
  home_featured_listings: {
    key: "home_featured_listings",
    label: "Featured listings rail",
    description: "Landing page listing section title, tabs, labels, and item counts.",
    defaultContent: DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT,
  },
  home_sections: {
    key: "home_sections",
    label: "Homepage sections",
    description: "Controls which major landing page modules are visible.",
    defaultContent: DEFAULT_HOME_SECTIONS_CMS_CONTENT,
  },
};
