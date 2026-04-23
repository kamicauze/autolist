import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminAdsBannersRoute() {
  return (
    <AdminPlaceholderPage
      title="Ads & Banners"
      description="This content-management page was only a UI scaffold. It now presents the actual state: the admin shell is ready, but banner management is not wired."
      nextSteps={[
        "Model banner placements, creative assets, and scheduling rules.",
        "Add CRUD actions for campaigns and placement targeting.",
        "Wire impression and click reporting after campaign delivery is live.",
      ]}
    />
  );
}
