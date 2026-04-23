import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholderPage
      title="Analytics"
      description="The previous analytics screen was a static preview. This route stays available as a placeholder until reporting is wired to real metrics."
      nextSteps={[
        "Define the live seller, buyer, and listing metrics required by operations.",
        "Query those metrics from production tables instead of local mock arrays.",
        "Add date filtering and export actions only after the underlying reports exist.",
      ]}
    />
  );
}
