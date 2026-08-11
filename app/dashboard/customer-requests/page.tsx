import { CustomerRequestsManager } from "@/components/dashboard/appointments/customer-requests-manager";
import { getAppointmentsDashboardData } from "@/lib/data/appointments";

export default async function CustomerRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const [data, params] = await Promise.all([getAppointmentsDashboardData(), searchParams]);
  return (
    <CustomerRequestsManager
      initialData={data}
      initialRequestId={params.appointment || null}
    />
  );
}
