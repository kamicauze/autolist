import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { LoginForm } from "@/components/auth/login-form";
import { resolvePostAuthPath } from "@/lib/supabase/auth-routing";
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
    const destination = await resolvePostAuthPath(supabase, user.id, requestedNextPath);
    redirect(destination);
  }

  return (
    <AuthModalShell
      title="Login"
      imageAlt="Front view of a gold BMW X2"
      imageSrc="/auth/login-bmw-x2-front.jpg"
    >
      <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-gray-100" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </AuthModalShell>
  );
}
