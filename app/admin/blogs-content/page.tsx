import { AdminBlogsContentLive } from "@/components/admin/admin-blogs-content-live";
import { getAdminCmsMediaData } from "@/lib/data/cms-media";
import { getAdminContentPostsData } from "@/lib/data/content-posts";

export default async function AdminBlogsContentRoute() {
  const [data, mediaData] = await Promise.all([
    getAdminContentPostsData(),
    getAdminCmsMediaData(),
  ]);

  return <AdminBlogsContentLive data={data} mediaData={mediaData} />;
}
