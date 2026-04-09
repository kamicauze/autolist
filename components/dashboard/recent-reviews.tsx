"use client";

import { SellerReviewSnippet, SellerSurface, sellerReviews } from "./seller-dashboard-ui";

export function RecentReviews() {
  return (
    <SellerSurface className="p-5">
      <div className="mb-5">
        <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Recent Reviews</h2>
        <p className="mt-1 text-[13px] text-[#7a7a7a]">
          Latest buyer feedback from your published listings.
        </p>
      </div>

      <div className="space-y-4">
        {sellerReviews.slice(0, 3).map((review) => (
          <SellerReviewSnippet key={review.id} review={review} />
        ))}
      </div>
    </SellerSurface>
  );
}
