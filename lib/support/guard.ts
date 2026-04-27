import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireSupportPage(nextPath = "/support/tickets") {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  if (!profile || !["admin", "super_admin", "support"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return { supabase, user, role: profile.role };
}
