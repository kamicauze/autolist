import { AdminInsuranceRequestsLive } from "@/components/admin/admin-insurance-requests-live";
import { getAdminInsuranceRequestsData } from "@/lib/data/insurance";

export default async function AdminInsuranceRequestsRoute() {
  const data = await getAdminInsuranceRequestsData();
  return <AdminInsuranceRequestsLive data={data} />;
}
