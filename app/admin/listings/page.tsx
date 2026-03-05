import { getPendingListings } from "@/lib/actions/listings";
import { AdminListingsClient } from "@/components/admin/admin-listings-client";

export default async function AdminListingsPage() {
  const { data: listings } = await getPendingListings();
  return <AdminListingsClient listings={listings || []} />;
}
