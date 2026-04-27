import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/admin/guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDataAccessNotice, getAdminNavBadgeCounts } from "@/lib/data/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdminPage("/admin");
  const badgeCounts = await getAdminNavBadgeCounts();
  const dataAccessNotice = getAdminDataAccessNotice();

  return (
    <AdminShell
      user={{
        email: user.email,
        user_metadata: user.user_metadata,
      }}
      badgeCounts={badgeCounts}
      dataAccessNotice={dataAccessNotice}
    >
      {children}
    </AdminShell>
  );
}
