import {
  SellerPageHeader,
  SellerReviewSnippet,
  SellerSurface,
} from "../seller-dashboard-ui";
import type {
  ListingReviewRecord,
  ListingReviewSummary,
} from "@/lib/types/listing-review";

type ReviewListProps = {
  summary?: ListingReviewSummary;
  reviews?: ListingReviewRecord[];
};

function getListingTitle(review: ListingReviewRecord) {
  if (!review.listing) {
    return undefined;
  }

  return `${review.listing.year} ${review.listing.make} ${review.listing.model}`;
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewList({
  summary = {
    averageRating: 0,
    totalReviews: 0,
  },
  reviews = [],
}: ReviewListProps) {
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
              <p className="text-[14px] text-[#7a7a7a]">{summary.totalReviews} total reviews</p>
            </div>
            <div className="rounded-full bg-brand-tint px-4 py-2 text-[13px] font-semibold text-primary">
              {summary.totalReviews > 0
                ? `${summary.averageRating.toFixed(1)} / 5.0 rating`
                : "No ratings yet"}
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto max-w-xl space-y-3">
              <h2 className="font-heading text-[28px] font-semibold text-[#202224]">
                No buyer reviews yet
              </h2>
              <p className="text-[14px] leading-6 text-[#767676]">
                Reviews from signed-in marketplace accounts will appear here as buyers leave
                public feedback on your listings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            {reviews.map((review) => (
              <SellerReviewSnippet
                key={review.id}
                review={{
                  id: review.id,
                  name: review.reviewer?.full_name || "Autolist buyer",
                  review: review.body,
                  date: formatReviewDate(review.created_at),
                  rating: review.rating,
                  listing: getListingTitle(review),
                }}
              />
            ))}
          </div>
        )}
      </SellerSurface>
    </div>
  );
}
