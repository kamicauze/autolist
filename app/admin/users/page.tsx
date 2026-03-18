import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

const nextSteps = [
  "List marketplace users with role, dealer linkage, and account state.",
  "Add suspend, reactivate, and role change actions behind strict admin checks.",
  "Surface moderation history so operator decisions are traceable.",
];

export default function AdminUsersPage() {
  return (
    <AdminPlaceholderPage
      title="User Management"
      description="This section is reserved for user administration, role changes, and account-level moderation workflows."
      nextSteps={nextSteps}
    />
  );
}
