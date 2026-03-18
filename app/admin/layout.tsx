import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/admin/guard";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdminPage("/admin");

  return (
    <AdminShell
      user={{
        email: user.email,
        user_metadata: user.user_metadata,
      }}
    >
      {children}
    </AdminShell>
  );
}
