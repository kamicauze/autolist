import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { DealerSaleForm } from "@/components/seller/dealer-sale-form";
import { getAllMakeNames } from "@/lib/data/car-data";
import { ALL_MAKES } from "@/lib/constants/car-data";
import {
  isPrivateSellerRole,
  resolvePostAuthPath,
} from "@/lib/supabase/auth-routing";
import { createClient } from "@/lib/supabase/server";

export default async function DealerSellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/sell/dealer")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (!isPrivateSellerRole(profile?.role)) {
    const destination = await resolvePostAuthPath(supabase, user.id);
    redirect(destination);
  }

  const makes = await getAllMakeNames();
  const makeOptions = makes.length > 0 ? makes : ALL_MAKES;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8 md:py-12">
        <Container size="xl">
          <DealerSaleForm makes={makeOptions} />
        </Container>
      </main>

      <Footer />
    </div>
  );
}
