import { AdminRolesPermissionsLive } from "@/components/admin/admin-roles-permissions-live";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAdminRolesPermissionsData } from "@/lib/data/admin";

interface AdminRolesPermissionsPageProps {
  searchParams?: Promise<{
    status?: string | string[];
    message?: string | string[];
  }>;
}

export default async function AdminRolesPermissionsRoute({
  searchParams,
}: AdminRolesPermissionsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const { user } = await requireAdminPage("/admin/roles-permissions");
  const data = await getAdminRolesPermissionsData();

  const status = typeof params?.status === "string" ? params.status : null;
  const message = typeof params?.message === "string" ? params.message : null;
  const feedback =
    status === "success" || status === "error"
      ? {
          status: status as "success" | "error",
          message: message || "Role update completed.",
        }
      : null;

  return <AdminRolesPermissionsLive data={data} currentUserId={user.id} feedback={feedback} />;
}
