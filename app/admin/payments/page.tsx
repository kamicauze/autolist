import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminPaymentsRoute() {
  return (
    <AdminPlaceholderPage
      title="Payments"
      description="The payments console was a preview-only surface. It has been replaced with a placeholder until real transaction data and reconciliation actions are implemented."
      nextSteps={[
        "Define the authoritative payment source and settlement tables.",
        "Add transaction list, detail, and reconciliation queries.",
        "Gate refunds and export actions behind real payment workflows.",
      ]}
    />
  );
}
