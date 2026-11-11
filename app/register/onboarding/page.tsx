import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { PrivateSellerRegistration } from "@/components/seller/private-seller-registration";
import { getMySellerVerification } from "@/lib/data/seller-verification";
import { privateSellerSetupDestination, sanitizeNextPath } from "@/lib/supabase/auth-routing";
import { hasCompleteSellerIdentity } from "@/lib/validations/registration";
import { OnboardingFlow } from "@/components/seller/onboarding-flow";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[]; next?: string | string[] }>;
}) {
  const query = await searchParams;
  const role = typeof query.role === "string" ? query.role : undefined;
  const next = typeof query.next === "string" ? query.next : undefined;
  const sellerSetup = role === "seller";
  const destination = privateSellerSetupDestination(next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (next) params.set("next", sanitizeNextPath(next));
    const path = "/register/onboarding" + (params.size ? "?" + params.toString() : "");
    redirect("/login?next=" + encodeURIComponent(path));
  }

  if (role === "dealer") redirect("/register/dealer");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone, whatsapp, bio, city, address, deactivated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.deactivated_at) redirect("/account-deactivated");
  if (sellerSetup) {
    if (!profile || !["buyer", "seller"].includes(profile.role)) redirect("/dashboard");
    const { record } = await getMySellerVerification();
    if (profile.role === "seller" && (record?.status === "pending" || record?.status === "approved" ||
        (record?.phone && hasCompleteSellerIdentity(record.documents.map((document) => document.document_type))))) {
      redirect(destination);
    }
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted px-4 py-8 md:py-12">
          <PrivateSellerRegistration initialPhone={record?.phone || profile.phone || ""} destination={destination} />
        </main>
        <Footer />
      </div>
    );
  }
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
