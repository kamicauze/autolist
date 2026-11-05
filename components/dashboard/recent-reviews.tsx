"use client";

import type { ListingReviewRecord } from "@/lib/types/listing-review";
import { SellerReviewSnippet, SellerSurface } from "./seller-dashboard-ui";

function toDisplayReview(review: ListingReviewRecord) {
  return {
    id: review.id,
    name: review.reviewer?.full_name || "Buyer",
    rating: review.rating,
    date: new Date(review.created_at).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    listing: review.listing
      ? `${review.listing.year} ${review.listing.make} ${review.listing.model}`
      : undefined,
    review: review.body,
  };
}

export function RecentReviews({ reviews = [] }: { reviews?: ListingReviewRecord[] }) {
  const items = reviews.map(toDisplayReview);

  return (
    <SellerSurface className="p-5">
      <div className="mb-5">
        <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Recent Reviews</h2>
        <p className="mt-1 text-[13px] text-[#7a7a7a]">
          Latest buyer feedback from your published listings.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((review) => (
            <SellerReviewSnippet key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-dashed border-[#e5e7eb] bg-[#faf9f7] px-4 py-8 text-center text-[13px] text-[#7a7a7a]">
          No buyer reviews yet. Reviews appear here once buyers rate your listings.
        </div>
      )}
    </SellerSurface>
  );
}
