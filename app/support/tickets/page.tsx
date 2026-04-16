import { AdminTicketQueue } from "@/components/admin/admin-ticket-queue";
import { getSupportQueueData } from "@/lib/data/messaging";

export default async function SupportTicketsPage() {
  const data = await getSupportQueueData();
  return (
    <AdminTicketQueue
      initialData={data}
      title="Support Tickets"
      description="Manage escalated buyer and seller conversations without full admin access."
    />
  );
}
