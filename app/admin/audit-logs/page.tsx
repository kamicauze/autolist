import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

const nextSteps = [
  "Create an audit log table for all admin mutations.",
  "Write actor, action, target, and before-or-after metadata from every admin server action.",
  "Expose searchable logs here for compliance and operational debugging.",
];

export default function AdminAuditLogsPage() {
  return (
    <AdminPlaceholderPage
      title="Audit Logs"
      description="Admin actions should become traceable before the moderation surface grows. This page is reserved for that event history."
      nextSteps={nextSteps}
    />
  );
}
