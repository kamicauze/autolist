import { AdminCmsLive } from "@/components/admin/admin-cms-live";
import { getAdminContentPagesData } from "@/lib/data/content-pages";

export default async function AdminCmsRoute() {
  const data = await getAdminContentPagesData();
  return <AdminCmsLive data={data} />;
}
