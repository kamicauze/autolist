import { getMyListings } from "@/lib/actions/listings";
import { MyListings } from "@/components/dashboard/listings/my-listings";

export default async function DashboardListingsPage() {
  const { data: listings } = await getMyListings();
  return <MyListings listings={listings || []} />;
}
