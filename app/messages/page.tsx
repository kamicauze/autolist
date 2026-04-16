import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/dashboard/messages/chat-layout";
import { getMessagingCenterData } from "@/lib/data/messaging";

export default async function BuyerMessagesPage() {
  const data = await getMessagingCenterData();

  if (!data?.viewer) {
    redirect("/login?next=/messages");
  }

  return <ChatLayout initialData={data} />;
}
