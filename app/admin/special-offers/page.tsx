import { AdminSpecialOffersLive } from "@/components/admin/admin-special-offers-live";
import { getAdminCmsMediaData } from "@/lib/data/cms-media";
import { getAdminCmsSpecialOffersData } from "@/lib/data/cms-special-offers";

export default async function AdminSpecialOffersRoute() {
  const [data, mediaData] = await Promise.all([
    getAdminCmsSpecialOffersData(),
    getAdminCmsMediaData(),
  ]);

  return <AdminSpecialOffersLive data={data} mediaData={mediaData} />;
}
