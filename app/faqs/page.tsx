import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  ChevronDown,
  CircleHelp,
  Clock,
  Coins,
  CreditCard,
  Headset,
  House,
  Lightbulb,
  ListChecks,
  PlusCircle,
  Search,
  ShieldCheck,
  Ship,
  Tag,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketplaceHero, MARKETPLACE_PAGE_WIDTH } from "@/components/layout/marketplace-hero";
import { SupportContactLinks } from "@/components/layout/support-contact-links";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionNav } from "@/components/finance/section-nav";
import { DataTable, GuideSection, Prose } from "@/components/finance/guide-elements";
import { FaqAnswer } from "@/components/faqs/faq-answer";
import {
  FAQ_CATEGORIES,
  FAQ_LAST_UPDATED,
  FAQ_QUICK_REFERENCE,
  SUPPORT_HOURS,
  faqAnswerToText,
  type FaqEntry,
} from "@/lib/constants/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Autolist",
  description:
    "Answers about buying, selling, accounts, payments, safety, imports, finance and support on Autolist Kenya.",
  alternates: { canonical: "/faqs" },
};

const sectionIcons: Record<string, LucideIcon> = {
  general: House,
  buyers: CarFront,
  sellers: Tag,
  accounts: UserRound,
  payments: CreditCard,
  safety: ShieldCheck,
  "import-export": Ship,
  "finance-insurance": Coins,
  support: Headset,
  "quick-reference": ListChecks,
};

const popularTopics = [
  { label: "List a vehicle", question: "How do I list my vehicle for sale?" },
  { label: "Buy safely", question: "Is it safe to buy a car from a private seller on Autolist?" },
  { label: "Find a vehicle", question: "How do I find a vehicle on Autolist Kenya?" },
  { label: "Verify a seller", question: "How do I verify a seller's identity?" },
  { label: "Imported vehicles", question: "Can I list an imported vehicle on Autolist Kenya?" },
  { label: "Reset your password", question: "I forgot my password. What should I do?" },
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

const FAQ_SEARCH_LIMIT = 120;

function searchWords(text: string) {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

function questionId(question: string) {
  return "faq-" + searchWords(question).join("-");
}

function FaqQuestion({ item, initiallyOpen }: { item: FaqEntry; initiallyOpen: boolean }) {
  return (
    <details open={initiallyOpen || undefined} className="group overflow-hidden rounded-xl border border-border bg-card open:border-primary/25 open:bg-brand-tint">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-semibold text-card-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
        {item.question}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-primary" aria-hidden="true" />
      </summary>
      <div id={questionId(item.question)} className="scroll-mt-36 px-4 pb-4 text-sm leading-6 text-foreground/85 sm:px-5 xl:scroll-mt-40 [&_li]:mt-1 [&_p+p]:mt-2 [&_p+ul]:mt-2 [&_ul+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        <FaqAnswer blocks={item.answer} />
      </div>
    </details>
  );
}

export default async function FAQsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.slice(0, FAQ_SEARCH_LIMIT).trim() ?? "";
  const terms = searchWords(query);
  const categories = query
    ? FAQ_CATEGORIES.map((category) => ({
        ...category,
        items: category.items.filter(({ question, answer }) => {
          const text = searchWords(question + " " + faqAnswerToText(answer)).join(" ");
          return terms.length > 0 && terms.every((term) => text.includes(term));
        }),
      })).filter((category) => category.items.length > 0)
    : FAQ_CATEGORIES;
  const resultCount = categories.reduce((count, category) => count + category.items.length, 0);
  const sections = categories.map(({ id, label }) => ({ id, label }));
  if (!query) sections.push({ id: "quick-reference", label: "Quick reference" });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-brand-soft-surface">
        {!query && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
            }}
          />
        )}

        <MarketplaceHero imageSrc="/images/marketing/faq-hero.webp" imageClassName="lg:w-[56%]" className="lg:min-h-[318px]">
          <div className="pt-5 pb-5 sm:pt-6 lg:pb-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
            <div className="mt-5 max-w-[40rem] lg:max-w-[54%]">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#173263] shadow-sm">
                <CircleHelp className="h-4 w-4 text-primary" aria-hidden="true" />
                Help &amp; Support
              </p>
              <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl xl:text-[46px]">
                Frequently Asked Questions
              </h1>
              <p className="mt-2 max-w-[31rem] text-base leading-snug text-slate-700 xl:text-lg">
                Find answers about buying, selling, accounts, payments, safety, imports, and more on Autolist Kenya.
              </p>
              <form
                action="/faqs#faq-results"
                role="search"
                aria-label="Frequently asked questions"
                className="mt-5 flex max-w-[41rem] items-center gap-2 rounded-xl border border-[#dce6f2] bg-white p-1.5 shadow-sm"
              >
                <label htmlFor="faq-search" className="sr-only">Search frequently asked questions</label>
                <Search className="ml-2.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                <input
                  id="faq-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  maxLength={FAQ_SEARCH_LIMIT}
                  placeholder="Search a question (e.g., list a vehicle)"
                  className="min-w-0 flex-1 rounded-md px-1 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-primary"
                />
                <Button type="submit" size="sm" className="h-9 shrink-0 rounded-lg px-3.5 sm:min-w-24 sm:px-5">
                  Search
                </Button>
              </form>
              <a href="#faq-help" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-[#173263] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden">
                <Headset className="h-4 w-4" aria-hidden="true" />
                Contact support
              </a>
            </div>
          </div>
        </MarketplaceHero>

        {sections.length > 0 && (
          <SectionNav
            ariaLabel="FAQ categories"
            containerClassName={MARKETPLACE_PAGE_WIDTH}
            sections={sections.map(({ id, label }) => {
              const Icon = sectionIcons[id] ?? CircleHelp;
              return { id, label, icon: <Icon className="h-4 w-4" aria-hidden="true" /> };
            })}
          />
        )}

        <div
          id="faq-results"
          className={MARKETPLACE_PAGE_WIDTH + " grid scroll-mt-40 gap-7 py-7 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8 lg:pt-9 lg:pb-14"}
        >
          <div className="flex min-w-0 flex-col gap-9">
            {query && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h2 className="break-words font-bold text-foreground">Results for “{query}”</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resultCount === 0
                    ? "No matching questions. Try another term or browse all categories."
                    : resultCount + (resultCount === 1 ? " matching question" : " matching questions")}
                </p>
                <Link href="/faqs#faq-results" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                  Clear search
                </Link>
              </div>
            )}

            {categories.map((category, categoryIndex) => (
              <GuideSection
                key={category.id}
                id={category.id}
                eyebrow={category.label}
                title={category.title}
                className={categoryIndex === 0 ? "scroll-mt-40 border-t-0 pt-0" : "scroll-mt-40 pt-7"}
              >
                <div className="mt-4 space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <FaqQuestion
                      key={item.question}
                      item={item}
                      initiallyOpen={categoryIndex === 0 && itemIndex === 0}
                    />
                  ))}
                </div>
              </GuideSection>
            ))}

            {!query && (
              <GuideSection id="quick-reference" eyebrow="Quick reference" title="The short version" className="scroll-mt-40">
                <Prose>The key points from each part of this page.</Prose>
                <DataTable
                  caption="Quick reference summary"
                  columns={["Topic", "Key takeaway"]}
                  rows={FAQ_QUICK_REFERENCE.map((row) => [row.topic, row.takeaway])}
                />
                <p className="mt-5 text-sm text-muted-foreground">Last updated {FAQ_LAST_UPDATED}</p>
              </GuideSection>
            )}
          </div>

          <aside id="faq-help" aria-label="Contact support and popular topics" className="min-w-0 scroll-mt-40 space-y-5">
            <section className="rounded-2xl border border-border/60 bg-brand-tint p-4 sm:p-5">
              <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground sm:text-xl">
                <Headset className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                Still need help?
              </h2>
              <p className="mt-2 mb-3 text-sm leading-relaxed text-muted-foreground">
                Include your listing link or account email so we can help faster.
              </p>
              <SupportContactLinks includeSafety />
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {SUPPORT_HOURS}
              </p>
            </section>
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-card-foreground sm:text-xl">
                <Lightbulb className="h-6 w-6 shrink-0 text-amber-500" aria-hidden="true" />
                Popular topics
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {popularTopics.map(({ label, question }) => (
                  <li key={label}>
                    <a
                      href={(query ? "/faqs" : "") + "#" + questionId(question)}
                      className="inline-flex min-h-9 items-center rounded-full border border-primary/20 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <section className="bg-brand-tint py-12 md:py-16">
          <div className={MARKETPLACE_PAGE_WIDTH + " text-center"}>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to get started?</h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground/80">
              Browse vehicles from dealers and private sellers across Kenya, or list your own in a few minutes.
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
