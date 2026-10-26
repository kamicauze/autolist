import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { RichContentRenderer } from "@/components/cms/rich-content-renderer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  buildManagedContentPageMetadata,
  formatContentPageDate,
  getPublishedContentPageBySlug,
} from "@/lib/data/content-pages";

const SLUG = "about";
const sectionClass = "mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedContentPageMetadata(SLUG);
}

export default async function AboutPage() {
  const page = await getPublishedContentPageBySlug(SLUG);
  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <section className="border-b border-gray-200">
          <div className={"mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8"}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Autolist</p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">{page.title}</h1>
              {page.summary ? <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">{page.summary}</p> : null}
              <Link href="/search" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">Explore vehicles <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src="/images/marketing/about-nairobi-hero.webp" alt="Nairobi skyline and a vehicle overlooking the city" fill priority sizes="(min-width: 1024px) 650px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section className={`${sectionClass} grid gap-8 lg:grid-cols-[1.2fr_1fr]`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Our company</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-gray-900">About Autolist Kenya</h2>
            <div className="mt-5"><RichContentRenderer body={page.body} /></div>
            {page.publishedAt ? <p className="mt-5 text-xs text-gray-500">Published {formatContentPageDate(page.publishedAt)}</p> : null}
          </div>
          <aside className="self-start rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900">At a glance</h3>
            <dl className="mt-5 divide-y divide-blue-100">
              {[
                ["Marketplace", "Vehicle buying and selling"],
                ["Who we serve", "Buyers, private sellers and dealerships"],
                ["Coverage", "Kenya"],
              ].map(([label, value]) => <div key={label} className="grid grid-cols-[0.8fr_1.2fr] gap-4 py-4 text-sm leading-6"><dt className="text-gray-600">{label}</dt><dd className="font-medium text-gray-900">{value}</dd></div>)}
              <div className="grid grid-cols-[0.8fr_1.2fr] gap-4 py-4 text-sm leading-6"><dt className="text-gray-600">Platform</dt><dd><a href="https://www.autolist.co.ke" className="break-all font-medium text-primary hover:underline">www.autolist.co.ke</a></dd></div>
            </dl>
          </aside>
        </section>

        <section className="border-y border-blue-100 bg-blue-50/60">
          <div className={sectionClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">What drives us</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-gray-900">Built around trust, clarity and progress</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">We focus on practical solutions that make the vehicle marketplace better for everyone.</p>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {[
                { icon: FileText, title: "Clearer information", description: "Useful listing details and helpful content support more informed decisions." },
                { icon: Wrench, title: "Practical tools", description: "Simple listing tools, communication and discovery features save time for sellers and buyers." },
                { icon: ShieldCheck, title: "More trustworthy transactions", description: "Moderation, safer interactions and clear processes help reduce risk and build confidence." },
              ].map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border border-gray-200 bg-white p-6"><Icon className="h-6 w-6 text-primary" aria-hidden="true" /><h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{description}</p></article>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="road-ahead-title">
          <div className={`${sectionClass} grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">The road ahead</p>
              <h2 id="road-ahead-title" className="mt-3 max-w-lg font-heading text-3xl font-semibold text-gray-900">A better vehicle marketplace for Kenya</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600">We’re committed to improving our tools and services and supporting a safer, more transparent automotive community in Kenya. Tell us what would make your experience better.</p>
              <Link href="/inquiries-assistance#inquiry-form" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">Send us feedback <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src="/images/marketing/about-road-ahead.webp" alt="A winding road through Kenya’s highlands" fill sizes="(min-width: 1024px) 650px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
