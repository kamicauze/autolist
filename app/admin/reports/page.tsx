import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminReportsRoute() {
  return (
    <AdminPlaceholderPage
      title="Reports"
      description="This reporting surface was only scaffold UI. It now stays honest about the missing backend work instead of rendering mock records."
      nextSteps={[
        "Define report types and the tables each report reads from.",
        "Implement server-side filters and export generation.",
        "Add pagination only after report queries return real datasets.",
      ]}
    />
  );
}
