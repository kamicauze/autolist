import { AdminTicketQueue } from "@/components/admin/admin-ticket-queue";
import { getSupportQueueData } from "@/lib/data/messaging";

export default async function AdminInquiriesAssistanceRoute() {
  const data = await getSupportQueueData();
  return (
    <AdminTicketQueue
      initialData={data}
      title="Inquiries & Assistance"
      description="Manage buyer and seller assistance requests submitted from the public inquiries page."
    />
  );
}
