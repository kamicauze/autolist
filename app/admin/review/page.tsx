import { getPendingListings } from "@/lib/actions/listings";
import { AdminListingsClient } from "@/components/admin/admin-listings-client";
import { getDuplicateReviewSuggestions } from "@/lib/data/admin-listing-review";

export default async function AdminReviewPage() {
  const { data: listings } = await getPendingListings();
  const safeListings = listings || [];
  const duplicateSuggestions = await getDuplicateReviewSuggestions(safeListings);

  return <AdminListingsClient listings={safeListings} duplicateSuggestions={duplicateSuggestions} />;
}
