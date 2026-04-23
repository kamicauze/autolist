import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSettingsRoute() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      description="System settings were previously rendered as static form controls. This placeholder prevents the admin from implying those values can be saved."
      nextSteps={[
        "Decide which configuration belongs in database-backed settings.",
        "Implement read and write actions with validation and audit logging.",
        "Expose save controls only after the persistence layer is complete.",
      ]}
    />
  );
}
