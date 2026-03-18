import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getUserRole(supabase: ServerSupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return profile?.role ?? null;
}

export async function requireAdminPage(nextPath = "/admin") {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user };
}

type AdminActionContext =
  | { error: "Unauthorized" | "Forbidden: Admin only." }
  | { supabase: ServerSupabaseClient; user: User };

export async function requireAdminAction(): Promise<AdminActionContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "admin") {
    return { error: "Forbidden: Admin only." };
  }

  return { supabase, user };
}
