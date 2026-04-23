import { AdminAnalyticsLive } from "@/components/admin/admin-analytics-live";
import { getAdminAnalyticsData } from "@/lib/data/admin";

export default async function AdminAnalyticsPage() {
  const data = await getAdminAnalyticsData();
  return <AdminAnalyticsLive data={data} />;
}
