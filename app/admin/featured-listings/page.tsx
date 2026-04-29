import { AdminFeaturedListingsLive } from "@/components/admin/admin-featured-listings-live";
import { getAdminFeaturedListingPinsData } from "@/lib/data/featured-listing-pins";

export default async function AdminFeaturedListingsRoute() {
  const data = await getAdminFeaturedListingPinsData();

  return <AdminFeaturedListingsLive data={data} />;
}
