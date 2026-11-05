import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { OnboardingFlow } from "@/components/seller/onboarding-flow";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/register/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone, whatsapp, bio, city, address")
    .eq("id", user.id)
    .maybeSingle();
  const metadataName = user.user_metadata?.full_name;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8 md:py-12">
        <Container size="xl">
          <Suspense fallback={<div className="h-[520px] animate-pulse rounded-2xl bg-white" aria-hidden />}>
            <OnboardingFlow
              initialProfile={{
                ...profile,
                email: user.email,
                full_name: profile?.full_name || (typeof metadataName === "string" ? metadataName : undefined),
              }}
            />
          </Suspense>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
