import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminBlogsContentRoute() {
  return (
    <AdminPlaceholderPage
      title="Blogs & Content"
      description="Blog and editorial management is not connected to a CMS or database yet. This route now shows a placeholder instead of representative content rows."
      nextSteps={[
        "Choose the publishing source of truth for editorial content.",
        "Implement draft, review, and publish mutations against that source.",
        "Add authoring and scheduling tools only after persistence is in place.",
      ]}
    />
  );
}
