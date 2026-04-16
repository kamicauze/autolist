import { AdminDashboardLive } from "@/components/admin/admin-dashboard-live";
import { getAdminDashboardData } from "@/lib/data/admin";

export default async function AdminDashboardRoute() {
  const data = await getAdminDashboardData();
  return <AdminDashboardLive data={data} />;
}
