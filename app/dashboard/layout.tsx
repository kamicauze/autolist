import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

interface DashboardLayoutPageProps {
  children: ReactNode;
}

export default async function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <DashboardLayout
      user={{
        email: user.email,
        user_metadata: user.user_metadata,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
