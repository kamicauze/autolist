import { AdminTicketQueue } from "@/components/admin/admin-ticket-queue";
import { getSupportQueueData } from "@/lib/data/messaging";

export default async function AdminInquiriesAssistanceRoute() {
  const data = await getSupportQueueData();
  return (
    <AdminTicketQueue
      initialData={data}
      title="Customer Support Inquiries"
      description="Manage customer support questions submitted from the public inquiries and assistance page."
    />
  );
}
