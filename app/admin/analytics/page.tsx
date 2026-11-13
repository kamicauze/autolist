import { AdminAnalyticsLive } from "@/components/admin/admin-analytics-live";
import { getAdminAnalyticsData } from "@/lib/data/admin";
import { getSiteTrafficData } from "@/lib/data/site-traffic";

export default async function AdminAnalyticsPage() {
  const [data, traffic] = await Promise.all([getAdminAnalyticsData(), getSiteTrafficData()]);
  return <AdminAnalyticsLive data={data} traffic={traffic} />;
}
