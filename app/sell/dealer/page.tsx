import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { DealerSignupFlow } from "@/components/seller/dealer-signup-flow";

export default function DealerSellPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8 md:py-12">
        <Container size="xl">
          <DealerSignupFlow previewMode />
        </Container>
      </main>

      <Footer />
    </div>
  );
}
