import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { PricingCards } from "@/components/membership/pricing-cards";

export default function MembershipPublicPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-16">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dealer membership</p>
            <h1 className="mt-3 text-4xl font-bold text-foreground">Choose a plan for your dealership</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Transparent monthly plans based on live vehicle inventory. Private sellers can start with a free listing during the pilot.
            </p>
          </div>
          <PricingCards />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
