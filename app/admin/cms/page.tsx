import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminCmsRoute() {
  return (
    <AdminPlaceholderPage
      title="CMS"
      description="The CMS route was a shell around mock content data. It now stays explicit about the missing backend integration."
      nextSteps={[
        "Define which pages and content blocks should be CMS-managed.",
        "Implement storage and versioning for those blocks.",
        "Add publish controls only after the content source is authoritative.",
      ]}
    />
  );
}
