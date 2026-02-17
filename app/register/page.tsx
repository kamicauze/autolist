import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { resolvePostAuthPath } from "@/lib/supabase/auth-routing";
import { USER_ROLE_OPTIONS } from "@/lib/constants/marketplace";
import { createClient } from "@/lib/supabase/server";

interface RegisterPageProps {
  searchParams?: {
    role?: string | string[];
  };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const requestedRole =
      typeof searchParams?.role === "string" ? searchParams.role : undefined;
    const isKnownRole = USER_ROLE_OPTIONS.some((option) => option.value === requestedRole);
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
