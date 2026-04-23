import { AdminAuditLogsLive } from "@/components/admin/admin-audit-logs-live";
import { getAdminAuditLogsData } from "@/lib/data/admin";

export default async function AdminAuditLogsPage() {
  const data = await getAdminAuditLogsData();
  return <AdminAuditLogsLive data={data} />;
}
