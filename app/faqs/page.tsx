import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, PlusCircle, ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionNav, type GuideSectionLink } from "@/components/finance/section-nav";
import { DataTable, FaqItem, GuideSection, Prose } from "@/components/finance/guide-elements";
import { FaqAnswer } from "@/components/faqs/faq-answer";
import {
  FAQ_CATEGORIES,
  FAQ_LAST_UPDATED,
  FAQ_QUICK_REFERENCE,
  SAFETY_EMAIL,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  faqAnswerToText,
} from "@/lib/constants/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Autolist",
  description:
    "Answers about buying, selling, accounts, payments, safety, imports, finance and support on Autolist Kenya.",
  alternates: { canonical: "/faqs" },
};

const sections: GuideSectionLink[] = [
  ...FAQ_CATEGORIES.map((category) => ({ id: category.id, label: category.label })),
  { id: "quick-reference", label: "Quick reference" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: faqAnswerToText(item.answer) },
    }))
  ),
};

export default function FAQsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />

        <div className="border-b border-border bg-brand-tint">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently asked questions
            </h1>
            <p className="mt-3 max-w-prose text-lg leading-8 text-foreground/80">
              How Autolist Kenya works for buyers, sellers and dealers: accounts, payments, safety,
              imports, finance and getting help.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated {FAQ_LAST_UPDATED}</p>
          </div>
        </div>

        <SectionNav sections={sections} />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
          <div className="flex min-w-0 flex-col gap-12">
            {FAQ_CATEGORIES.map((category) => (
              <GuideSection
                key={category.id}
                id={category.id}
                eyebrow={category.label}
                title={category.title}
              >
                <div className="mt-5 max-w-3xl border-t border-border">
                  {category.items.map((item) => (
                    <FaqItem key={item.question} question={item.question}>
                      <FaqAnswer blocks={item.answer} />
                    </FaqItem>
                  ))}
                </div>
              </GuideSection>
            ))}

            <GuideSection id="quick-reference" eyebrow="Quick reference" title="The short version">
              <Prose>The key points from each part of this page.</Prose>
              <div className="max-w-3xl">
                <DataTable
                  caption="Quick reference summary"
                  columns={["Topic", "Key takeaway"]}
                  rows={FAQ_QUICK_REFERENCE.map((row) => [row.topic, row.takeaway])}
                />
              </div>
            </GuideSection>
          </div>

          <aside aria-label="Contact support">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-32 xl:top-40">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Still need help?
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                Our team answers by email. Include your listing link or account email so we can help
                faster.
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-foreground">Support</dt>
                    <dd>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-foreground">Safety reports</dt>
                    <dd>
                      <a
                        href={`mailto:${SAFETY_EMAIL}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {SAFETY_EMAIL}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-foreground">Hours</dt>
                    <dd className="text-muted-foreground">{SUPPORT_HOURS}</dd>
                  </div>
                </div>
              </dl>
              <Button asChild size="sm" className="mt-5 w-full">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail />
                  Email support
                </a>
              </Button>
            </div>
          </aside>
        </div>

        <section className="bg-brand-tint py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to get started?</h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground/80">
              Browse vehicles from dealers and private sellers across Kenya, or list your own in a few
              minutes.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/search">
                  Browse listings
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/sell">
                  <PlusCircle />
                  Sell a vehicle
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
