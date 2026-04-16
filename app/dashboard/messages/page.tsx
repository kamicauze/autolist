import { ChatLayout } from "@/components/dashboard/messages/chat-layout";
import { getMessagingCenterData } from "@/lib/data/messaging";

export default async function MessagesPage() {
  const data = await getMessagingCenterData();
  return <ChatLayout initialData={data} />;
}
