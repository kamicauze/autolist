export const MIN_LISTING_REVIEW_LENGTH = 20;
export const MAX_LISTING_REVIEW_LENGTH = 1200;

export interface ListingReviewAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ListingReviewListing {
  id: string;
  make: string;
  model: string;
  year: number;
}

export interface ListingReviewRecord {
  id: string;
  listing_id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
  reviewer: ListingReviewAuthor | null;
  listing: ListingReviewListing | null;
}

export interface ListingReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export interface SellerReviewDashboardData {
  reviews: ListingReviewRecord[];
  summary: ListingReviewSummary;
}

export interface VehicleListingReviewsData {
  reviews: ListingReviewRecord[];
  summary: ListingReviewSummary;
  viewerReview: ListingReviewRecord | null;
}
