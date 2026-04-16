import { AdminListingsOverviewLive } from "@/components/admin/admin-listings-overview-live";
import { getAdminListingsOverviewData } from "@/lib/data/admin";

export default async function AdminListingsPage() {
  const data = await getAdminListingsOverviewData();
  return <AdminListingsOverviewLive data={data} />;
}
