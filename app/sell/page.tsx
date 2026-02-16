import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { USER_ROLE_OPTIONS } from "@/lib/constants/marketplace";

export default function SellPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <Container size="xl" className="space-y-8">
          <header className="space-y-3">
            <Badge variant="secondary">Sell on Autolist</Badge>
            <h1 className="text-4xl font-bold text-foreground">
              Choose how you want to sell
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Start with a role-aware onboarding flow. The forms are modular so final Figma
              visuals can be swapped in without changing business logic.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            {USER_ROLE_OPTIONS.map((role) => (
              <article
                key={role.value}
                className="rounded-xl border border-border bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {role.label}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
                <Button asChild className="mt-4 w-full">
                  <Link href={`/register?role=${role.value}`}>Continue as {role.label}</Link>
                </Button>
              </article>
            ))}
          </div>

          <section className="rounded-xl border border-info/20 bg-info/5 p-5">
            <h2 className="text-xl font-semibold text-foreground">Dealer onboarding path</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dealers requiring verification can start the full sign-up and document workflow.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/register/dealer">Open dealer sign-up</Link>
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-xl font-semibold text-foreground">Seller Workbench (UI Preview)</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Public preview routes for QA and Playwright E2E while auth-gated flows are still in progress.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/sell/onboarding">Open onboarding flow</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sell/listing">Open listing wizard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sell/dashboard">Open dashboard preview</Link>
              </Button>
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
