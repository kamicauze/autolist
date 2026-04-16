import { AdminUsersLive } from "@/components/admin/admin-users-live";
import { getAdminUsersOverviewData } from "@/lib/data/admin";

export default async function AdminUsersPage() {
  const data = await getAdminUsersOverviewData();
  return <AdminUsersLive data={data} />;
}
