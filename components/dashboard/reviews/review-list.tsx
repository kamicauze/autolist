"use client";

import {
  SellerPageHeader,
  SellerPagination,
  SellerReviewSnippet,
  SellerSurface,
  sellerReviews,
} from "../seller-dashboard-ui";

export function ReviewList() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="All Reviews"
        description="Read the complete stream of public buyer feedback attached to your seller account and listings."
      />

      <SellerSurface className="overflow-hidden">
        <div className="border-b border-[#ededed] px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[14px] text-[#7a7a7a]">{sellerReviews.length} total reviews</p>
            </div>
            <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-semibold text-[#2563eb]">
              4.8 / 5.0 rating
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {sellerReviews.map((review) => (
            <SellerReviewSnippet key={review.id} review={review} />
          ))}
        </div>

        <SellerPagination />
      </SellerSurface>
    </div>
  );
}
