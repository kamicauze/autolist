import { AdminPaymentsLive } from "@/components/admin/admin-payments-live";
import { getAdminPaymentsData } from "@/lib/data/admin";

export default async function AdminPaymentsRoute() {
  const data = await getAdminPaymentsData();
  return <AdminPaymentsLive data={data} />;
}
