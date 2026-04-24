import { redirect } from "next/navigation";
import { SalesAgentsManager } from "@/components/dashboard/sales-agents/sales-agents-manager";
import { getDashboardAccountContext } from "@/lib/data/dashboard-account";
import { getMySalesAgents } from "@/lib/data/sales-agents";
import { createClient } from "@/lib/supabase/server";

export default async function SalesAgentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/sales-agents");
  }

  const accountContext = await getDashboardAccountContext(supabase, user.id);
  if (accountContext.kind !== "dealer") {
    redirect("/dashboard");
  }

  const { dealer, agents, error } = await getMySalesAgents();

  return <SalesAgentsManager dealer={dealer} agents={agents} error={error} />;
}
