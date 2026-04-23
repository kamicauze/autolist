import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminInsuranceRequestsRoute() {
  return (
    <AdminPlaceholderPage
      title="Insurance Requests"
      description="Insurance requests are not connected to a live queue yet. This route remains available as a placeholder rather than a fake admin table."
      nextSteps={[
        "Create the insurance request intake model and admin query path.",
        "Add assignment and status mutation actions for support staff.",
        "Expose SLA and conversion metrics after the queue is live.",
      ]}
    />
  );
}
