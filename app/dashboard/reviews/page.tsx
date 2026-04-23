import { ReviewList } from "@/components/dashboard/reviews/review-list";
import { getSellerDashboardReviewsData } from "@/lib/data/reviews";

export default async function ReviewsPage() {
  const reviewData = await getSellerDashboardReviewsData();

  return <ReviewList summary={reviewData.summary} reviews={reviewData.reviews} />;
}
