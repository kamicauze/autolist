import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type {
  ListingReviewRecord,
  ListingReviewSummary,
} from "@/lib/types/listing-review";

type ReviewsSectionProps = {
  summary?: ListingReviewSummary | null;
  reviews?: ListingReviewRecord[];
};

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsSection({
  summary = null,
  reviews = [],
}: ReviewsSectionProps) {
  const reviewCount = summary?.totalReviews ?? reviews.length;
  const averageRating = summary?.averageRating ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">User Reviews & Ratings</h2>

        <div className="mb-6 flex items-center gap-4 rounded-lg border border-brand-muted-border bg-brand-tint p-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-white p-2">
              <Star className="h-6 w-6 fill-current text-primary" />
            </div>
            <span className="text-4xl font-bold text-primary">
              {reviewCount > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-900">Outstanding</p>
            <p>
              {reviewCount} {reviewCount === 1 ? "rating and review" : "ratings and reviews"}
            </p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-600">
          Signed-in buyers can leave the first public review from this listing page after
          exploring the listing.
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-100 p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={review.reviewer?.avatar_url}
                    alt={review.reviewer?.full_name || "Autolist buyer"}
                    fallback={review.reviewer?.full_name || "AB"}
                    size="md"
                    className="h-10 w-10"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewer?.full_name || "Autolist buyer"}
                    </h4>
                    <div className="flex text-xs text-yellow-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-3 w-3 ${
                            index < review.rating ? "fill-current" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">
                  {formatReviewDate(review.created_at)}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-gray-600">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
