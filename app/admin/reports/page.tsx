import { AdminReportsLive } from "@/components/admin/admin-reports-live";
import { getAdminReportsData } from "@/lib/data/admin";

export default async function AdminReportsRoute() {
  const data = await getAdminReportsData();
  return <AdminReportsLive data={data} />;
}
