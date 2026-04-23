import { createClient } from "@/lib/supabase/server";
import { parseEnquiryReviewMessage } from "@/lib/reviews/enquiry-fallback";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type {
  ListingReviewRecord,
  ListingReviewSummary,
  SellerReviewDashboardData,
  VehicleListingReviewsData,
} from "@/lib/types/listing-review";

type ListingReviewRow = {
  id: string;
  listing_id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
  reviewer: ListingReviewRecord["reviewer"] | ListingReviewRecord["reviewer"][] | null;
  listing: ListingReviewRecord["listing"] | ListingReviewRecord["listing"][] | null;
};

type EnquiryReviewListingRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  seller_id: string;
};

type EnquiryReviewRow = {
  id: string;
  listing_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  reviewer: ListingReviewRecord["reviewer"] | ListingReviewRecord["reviewer"][] | null;
  listing: EnquiryReviewListingRow | EnquiryReviewListingRow[] | null;
};

function normalizeJoinedValue<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function summarizeReviews(reviews: ListingReviewRecord[]): ListingReviewSummary {
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: Number((totalRating / totalReviews).toFixed(1)),
    totalReviews,
  };
}

function mapReviewRow(row: ListingReviewRow): ListingReviewRecord {
  return {
    id: row.id,
    listing_id: row.listing_id,
    seller_id: row.seller_id,
    reviewer_id: row.reviewer_id,
    rating: row.rating,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewer: normalizeJoinedValue(row.reviewer),
    listing: normalizeJoinedValue(row.listing),
  };
}

function mapEnquiryReviewRow(row: EnquiryReviewRow): ListingReviewRecord | null {
  const parsed = parseEnquiryReviewMessage(row.message);
  if (!parsed) {
    return null;
  }

  const listing = normalizeJoinedValue(row.listing);

  return {
    id: row.id,
    listing_id: row.listing_id,
    seller_id: listing?.seller_id ?? "",
    reviewer_id: row.user_id,
    rating: parsed.rating,
    body: parsed.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewer: normalizeJoinedValue(row.reviewer),
    listing: listing
      ? {
          id: listing.id,
          make: listing.make,
          model: listing.model,
          year: listing.year,
        }
      : null,
  };
}

function mergeReviews(primary: ListingReviewRecord[], fallback: ListingReviewRecord[]) {
  const byKey = new Map<string, ListingReviewRecord>();

  for (const review of primary) {
    byKey.set(`${review.listing_id}:${review.reviewer_id}`, review);
  }

  for (const review of fallback) {
    const key = `${review.listing_id}:${review.reviewer_id}`;
    if (!byKey.has(key)) {
      byKey.set(key, review);
    }
  }

  return Array.from(byKey.values()).sort((left, right) =>
    right.created_at.localeCompare(left.created_at)
  );
}

const REVIEW_SELECT = `
  id,
  listing_id,
  seller_id,
  reviewer_id,
  rating,
  body,
  created_at,
  updated_at,
  reviewer:profiles!reviewer_id(id, full_name, avatar_url),
  listing:listings(id, make, model, year)
`;

const ENQUIRY_REVIEW_SELECT = `
  id,
  listing_id,
  user_id,
  message,
  created_at,
  updated_at,
  reviewer:profiles!user_id(id, full_name, avatar_url),
  listing:listings!listing_id(id, make, model, year, seller_id)
`;

async function getFallbackEnquiryReviews(
  listingId?: string
): Promise<ListingReviewRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select(ENQUIRY_REVIEW_SELECT)
    .order("created_at", { ascending: false });

  if (listingId) {
    query = query.eq("listing_id", listingId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as EnquiryReviewRow[])
    .map(mapEnquiryReviewRow)
    .filter((review): review is ListingReviewRecord => Boolean(review));
}

export async function getSellerDashboardReviewsData(): Promise<SellerReviewDashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      reviews: [],
      summary: {
        averageRating: 0,
        totalReviews: 0,
      },
    };
  }

  const { data, error } = await supabase
    .from("listing_reviews")
    .select(REVIEW_SELECT)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  let primaryReviews: ListingReviewRecord[] = [];
  if (error && !isMissingRelationError(error)) {
    console.error("Error fetching seller dashboard reviews:", error);
  } else if (!error) {
    primaryReviews = ((data || []) as ListingReviewRow[]).map(mapReviewRow);
  }

  let fallbackReviews: ListingReviewRecord[] = [];
  try {
    const allFallbackReviews = await getFallbackEnquiryReviews();
    fallbackReviews = allFallbackReviews.filter((review) => review.seller_id === user.id);
  } catch (fallbackError) {
    console.error("Error fetching fallback seller dashboard reviews:", fallbackError);
  }

  const reviews = mergeReviews(primaryReviews, fallbackReviews);

  return {
    reviews,
    summary: summarizeReviews(reviews),
  };
}

export async function getListingReviewsData(
  listingId: string
): Promise<VehicleListingReviewsData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("listing_reviews")
    .select(REVIEW_SELECT)
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  let primaryReviews: ListingReviewRecord[] = [];
  if (error && !isMissingRelationError(error)) {
    console.error("Error fetching listing reviews:", error);
  } else if (!error) {
    primaryReviews = ((data || []) as ListingReviewRow[]).map(mapReviewRow);
  }

  let fallbackReviews: ListingReviewRecord[] = [];
  try {
    fallbackReviews = await getFallbackEnquiryReviews(listingId);
  } catch (fallbackError) {
    console.error("Error fetching fallback listing reviews:", fallbackError);
  }

  const reviews = mergeReviews(primaryReviews, fallbackReviews);
  const viewerReview = user
    ? reviews.find((review) => review.reviewer_id === user.id) ?? null
    : null;

  return {
    reviews,
    summary: summarizeReviews(reviews),
    viewerReview,
  };
}
