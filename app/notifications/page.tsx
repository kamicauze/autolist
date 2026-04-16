import { NotificationInbox } from "@/components/notifications/notification-inbox";
import { getNotificationCenterData } from "@/lib/data/notifications";

export default async function NotificationsPage() {
  const data = await getNotificationCenterData();
  return <NotificationInbox initialData={data} />;
}
