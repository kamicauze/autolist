import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminRolesPermissionsRoute() {
  return (
    <AdminPlaceholderPage
      title="Roles & Permissions"
      description="Role management is not wired beyond the existing admin/support guards. This route now uses an explicit placeholder instead of a fake access-control matrix."
      nextSteps={[
        "Define application roles and permission boundaries in the database.",
        "Implement role assignment and policy enforcement updates.",
        "Add audit logging for permission changes before exposing edit controls.",
      ]}
    />
  );
}
