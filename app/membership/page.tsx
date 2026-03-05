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
            <h1 className="text-4xl font-bold text-foreground">Choose Your Listing Package</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Select a plan that fits your needs and start reaching thousands of buyers.
            </p>
          </div>
          <PricingCards />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
