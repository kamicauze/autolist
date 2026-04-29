import { AdminAdsBannersLive } from "@/components/admin/admin-ads-banners-live";
import { getAdminCmsBannersData } from "@/lib/data/cms-banners";
import { getAdminCmsMediaData } from "@/lib/data/cms-media";

export default async function AdminAdsBannersRoute() {
  const [data, mediaData] = await Promise.all([
    getAdminCmsBannersData(),
    getAdminCmsMediaData(),
  ]);

  return <AdminAdsBannersLive data={data} mediaData={mediaData} />;
}
