import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NotificationInbox } from "@/components/notifications/notification-inbox";
import { getNotificationCenterData } from "@/lib/data/notifications";

export const metadata = { title: "Notifications | Autolist" };

export default async function NotificationsPage() {
  const data = await getNotificationCenterData();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1"><NotificationInbox initialData={data} /></div>
      <Footer />
    </div>
  );
}
