export const CMS_SPECIAL_OFFER_STATUSES = ["draft", "active", "paused"] as const;

export type CmsSpecialOfferStatus = (typeof CMS_SPECIAL_OFFER_STATUSES)[number];

export type CmsSpecialOfferRecord = {
  id: string;
  title: string;
  audience: string;
  description: string;
  image_url: string;
  target_url: string | null;
  status: CmsSpecialOfferStatus;
  starts_at: string | null;
  ends_at: string | null;
  redemption_count: number;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsSpecialOffer = {
  id: string;
  title: string;
  audience: string;
  description: string;
  imageUrl: string;
  targetUrl: string | null;
  status: CmsSpecialOfferStatus;
  startsAt: string | null;
  endsAt: string | null;
  redemptionCount: number;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  isCurrentlyLive: boolean;
};

export type AdminCmsSpecialOffersData = {
  schemaReady: boolean;
  offers: CmsSpecialOffer[];
  stats: {
    total: number;
    live: number;
    scheduled: number;
    paused: number;
    totalRedemptions: number;
  };
};

export type SaveCmsSpecialOfferInput = {
  offerId: string;
  title: string;
  audience: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  status: CmsSpecialOfferStatus;
  startsAt: string;
  endsAt: string;
  redemptionCount: number;
  sortOrder: number;
};

export type CmsSpecialOfferMutationResult =
  | {
      success: true;
      offer: CmsSpecialOffer;
      message: string;
    }
  | {
      success: false;
      error: string;
    };
