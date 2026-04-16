import { AdminTicketQueue } from "@/components/admin/admin-ticket-queue";
import { getSupportQueueData } from "@/lib/data/messaging";

export default async function AdminCarInquiriesRoute() {
  const data = await getSupportQueueData();
  return <AdminTicketQueue initialData={data} />;
}
