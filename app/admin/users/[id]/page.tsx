import { AdminUserActivityLive } from "@/components/admin/admin-user-activity-live";
import { getAdminUserActivityData } from "@/lib/data/admin-user-detail";

type AdminUserActivityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserActivityPage({ params }: AdminUserActivityPageProps) {
  const { id } = await params;
  const data = await getAdminUserActivityData(id);

  return <AdminUserActivityLive data={data} />;
}
