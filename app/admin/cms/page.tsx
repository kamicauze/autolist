import { AdminCmsLive } from "@/components/admin/admin-cms-live";
import { getAdminHomepageCmsData } from "@/lib/data/cms";
import { getAdminCmsMediaData } from "@/lib/data/cms-media";
import { getAdminContentPagesData } from "@/lib/data/content-pages";

export default async function AdminCmsRoute() {
  const [pagesData, homepageData, mediaData] = await Promise.all([
    getAdminContentPagesData(),
    getAdminHomepageCmsData(),
    getAdminCmsMediaData(),
  ]);

  return (
    <AdminCmsLive
      pagesData={pagesData}
      homepageData={homepageData}
      mediaData={mediaData}
    />
  );
}
