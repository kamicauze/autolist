import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { resolvePostAuthPath, sanitizeNextPath } from "@/lib/supabase/auth-routing";
import { USER_ROLE_OPTIONS } from "@/lib/constants/marketplace";
import { createClient } from "@/lib/supabase/server";

interface RegisterPageProps {
  searchParams?: Promise<{
    role?: string | string[];
    next?: string | string[];
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const requestedRole =
      typeof resolvedSearchParams?.role === "string" ? resolvedSearchParams.role : undefined;
    const requestedNextPath =
      typeof resolvedSearchParams?.next === "string"
        ? sanitizeNextPath(resolvedSearchParams.next, "")
        : "";
    const isKnownRole = USER_ROLE_OPTIONS.some((option) => option.value === requestedRole);
    if (requestedNextPath) {
      redirect(requestedNextPath);
    }
    if (requestedRole === "dealer") {
      redirect("/register/dealer");
    }
    if (isKnownRole) {
      redirect(`/register/onboarding?role=${requestedRole}`);
    }

    const destination = await resolvePostAuthPath(supabase, user.id);
    redirect(destination);
  }

  return (
    <AuthModalShell
      title="Register"
      imageAlt="Autolist registration"
      imageSrc="/sample-car-2.jpg"
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" aria-hidden />}>
        <RegisterForm />
      </Suspense>
    </AuthModalShell>
  );
}
