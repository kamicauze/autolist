import { AdminTicketQueue } from "@/components/admin/admin-ticket-queue";
import { getSupportQueueData } from "@/lib/data/messaging";

export default async function AdminConversationTicketsPage() {
  const data = await getSupportQueueData("conversations");
  return (
    <AdminTicketQueue
      initialData={data}
      title="Conversation Tickets"
      description="Handle buyer and seller conversations explicitly escalated to staff. Ordinary vehicle enquiries remain in the seller's Messages inbox."
    />
  );
}
