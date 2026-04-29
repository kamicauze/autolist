import { AdminCmsLive } from "@/components/admin/admin-cms-live";
import { getAdminHomepageCmsData } from "@/lib/data/cms";
import { getAdminContentPagesData } from "@/lib/data/content-pages";

export default async function AdminCmsRoute() {
  const [pagesData, homepageData] = await Promise.all([
    getAdminContentPagesData(),
    getAdminHomepageCmsData(),
  ]);

  return <AdminCmsLive pagesData={pagesData} homepageData={homepageData} />;
}
