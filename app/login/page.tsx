import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginAccountShell } from "@/components/auth/login-account-shell";
import { LoginForm } from "@/components/auth/login-form";
import {
  inferMarketplaceRoleFromNextPath,
  resolvePostAuthPath,
  sanitizeNextPath,
} from "@/lib/supabase/auth-routing";
import { createClient } from "@/lib/supabase/server";

interface LoginPageProps {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const params = searchParams ? await searchParams : undefined;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const requestedNextPath =
      typeof params?.next === "string" ? params.next : undefined;
    const destination = await resolvePostAuthPath(
      supabase,
      user.id,
      requestedNextPath,
    );
    redirect(destination);
  }

  const requestedNextPath =
    typeof params?.next === "string" ? params.next : undefined;
  const safeNextPath = requestedNextPath
    ? sanitizeNextPath(requestedNextPath, "")
    : "";
  const inferredRole = safeNextPath
    ? inferMarketplaceRoleFromNextPath(safeNextPath)
    : null;
  const registerParams = new URLSearchParams();
  if (safeNextPath) registerParams.set("next", safeNextPath);
  if (inferredRole) registerParams.set("role", inferredRole);
  const registerHref =
    registerParams.size > 0
      ? `/register?${registerParams.toString()}`
      : "/register";

  return (
    <LoginAccountShell registerHref={registerHref}>
      <Suspense
        fallback={
          <div
            className="h-56 animate-pulse rounded-xl bg-gray-100"
            aria-hidden
          />
        }
      >
        <LoginForm />
      </Suspense>
    </LoginAccountShell>
  );
}
