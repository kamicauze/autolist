import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
type AdminRole = "admin" | "super_admin";

async function getUserRole(supabase: ServerSupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return profile?.role ?? null;
}

function isAdminRole(role: string | null): role is AdminRole {
  return role === "admin" || role === "super_admin";
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

  if (!isAdminRole(role)) {
    redirect("/dashboard");
  }

  return { supabase, user, role };
}

type AdminActionContext =
  | { error: "Unauthorized" | "Forbidden: Admin only." }
  | { supabase: ServerSupabaseClient; user: User; role: AdminRole };

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

  if (!isAdminRole(role)) {
    return { error: "Forbidden: Admin only." };
  }

  return { supabase, user, role };
}

type SuperAdminActionContext =
  | { error: "Unauthorized" | "Forbidden: Super admin only." }
  | { supabase: ServerSupabaseClient; user: User; role: "super_admin" };

export async function requireSuperAdminAction(): Promise<SuperAdminActionContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "super_admin") {
    return { error: "Forbidden: Super admin only." };
  }

  return { supabase, user, role };
}
