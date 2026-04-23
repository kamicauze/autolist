import { AdminBlogsContentLive } from "@/components/admin/admin-blogs-content-live";
import { getAdminContentPostsData } from "@/lib/data/content-posts";

export default async function AdminBlogsContentRoute() {
  const data = await getAdminContentPostsData();
  return <AdminBlogsContentLive data={data} />;
}
