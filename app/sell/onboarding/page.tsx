import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { OnboardingFlow } from "@/components/seller/onboarding-flow";

export default function SellerOnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8 md:py-12">
        <Container size="xl">
          <Suspense fallback={<div className="h-[520px] animate-pulse rounded-2xl bg-white" aria-hidden />}>
            <OnboardingFlow
              previewMode
              dashboardHref="/sell/dashboard"
              createListingHref="/dashboard/listings/new"
            />
          </Suspense>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
