import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, ShieldCheck, Users, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { RichContentRenderer } from "@/components/cms/rich-content-renderer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  buildManagedContentPageMetadata,
  formatContentPageDate,
  getPublishedContentPageBySlug,
} from "@/lib/data/content-pages";

const SLUG = "careers";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedContentPageMetadata(SLUG);
}

export default async function CareersPage() {
  const page = await getPublishedContentPageBySlug(SLUG);

  if (!page) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-[#f8fafc]">
        <section className="border-b border-[#e5e7eb] bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Work with Autolist
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-[#111827] sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-xl text-xl font-medium leading-8 text-[#202224]">
                Help make finding the right vehicle a clearer, more trusted experience.
              </p>
              {page.summary ? (
                <p className="mt-4 max-w-xl text-base leading-7 text-[#475467]">{page.summary}</p>
              ) : null}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#opportunities" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                  Explore opportunities <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="#our-purpose" className="inline-flex items-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                  Our purpose
                </Link>
              </div>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
              <Image src="/images/marketing/careers-team-hero.webp" alt="A team collaborating on vehicle marketplace ideas" fill priority sizes="(min-width: 1024px) 650px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section id="our-purpose" className="scroll-mt-24 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Our purpose</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-[#111827]">Build for the people behind every listing</h2>
              <p className="mt-4 text-base leading-7 text-[#475467]">
                Autolist connects vehicle buyers with private sellers and dealerships in Kenya. We focus on clear listings, useful tools and trust throughout the experience.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                { icon: Users, title: "Start with the user", description: "Make it easier for buyers and sellers to understand their next step." },
                { icon: ShieldCheck, title: "Make trust practical", description: "Support clear information, responsible decisions and respectful communication." },
                { icon: Wrench, title: "Improve what matters", description: "Solve real problems, learn from feedback and keep the experience straightforward." },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#475467]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="opportunities" className="scroll-mt-24 border-t border-gray-200 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-semibold text-[#111827]">Opportunities at Autolist</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#475467]">
              Read the latest team updates and any published opportunities below. Follow the application instructions included with each vacancy.
            </p>
            <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-10">
              <RichContentRenderer body={page.body} />
              {page.publishedAt ? (
                <p className="mt-6 text-xs text-gray-500">Published {formatContentPageDate(page.publishedAt)}</p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row sm:items-center">
              <p className="max-w-2xl text-sm leading-6 text-[#475467]">Have a question about working with Autolist? Contact the team through our enquiry form.</p>
              <Link href="/inquiries-assistance#inquiry-form" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Ask about opportunities <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
