import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { DealerSignupFlow } from "@/components/seller/dealer-signup-flow";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterDealerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/register/dealer");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8 md:py-12">
        <Container size="xl">
          <DealerSignupFlow />
        </Container>
      </main>

      <Footer />
    </div>
  );
}
