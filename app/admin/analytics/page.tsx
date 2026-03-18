import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

const nextSteps = [
  "Define core marketplace metrics for listings, users, dealer approvals, and moderation throughput.",
  "Add aggregate queries and daily snapshots before building charts.",
  "Ship a compact overview dashboard once the moderation and verification events are reliable.",
];

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholderPage
      title="Platform Analytics"
      description="Analytics should sit on top of trustworthy moderation and verification data, so this section is scaffolded now and filled once the event model is in place."
      nextSteps={nextSteps}
    />
  );
}
