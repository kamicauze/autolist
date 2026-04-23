import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthPath } from "@/lib/supabase/auth-routing";
import { SalesRepDashboardLayout } from "@/components/seller/sales-rep-dashboard";

interface SalesRepLayoutProps {
  children: ReactNode;
}

export default async function SalesRepLayout({ children }: SalesRepLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/sell/dashboard");
  }

  const destination = await resolvePostAuthPath(supabase, user.id);
  if (destination !== "/dashboard") {
    redirect(destination);
  }

  return <SalesRepDashboardLayout>{children}</SalesRepDashboardLayout>;
}
