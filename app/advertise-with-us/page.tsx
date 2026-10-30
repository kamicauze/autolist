import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdvertisingInquiryForm } from "@/components/shared/advertising-inquiry-form";

import { AdvertisingPlacementPreview } from "@/components/shared/advertising-placement-preview";

export const metadata: Metadata = {
  title: "Advertise With Autolist Kenya | Reach Car Buyers Nationwide",
  description: "Partner with Autolist Kenya to reach high-intent car buyers. Explore banner placements, in-feed sponsorships and bundled packages, and request our Media Kit.",
};

const audience = [
  ["15,000+", "Monthly unique visitors"], ["60,000+", "Monthly page views"],
  ["500+", "Active vehicle listings"], ["50+", "Registered dealers"],
  ["200+", "Private sellers each month"], ["Nationwide", "Reach across Kenya"],
];
const intent = [
  ["85%", "Researching a vehicle purchase"], ["60%", "Contact a seller directly"],
  ["40%", "In-market for financing"], ["30%", "Considering insurance at purchase"],
];
const placements = [
  { name: "Hero Banner", location: "Homepage, above the fold", rate: 120000 },
  { name: "Top Banner", location: "Homepage, below the search bar", rate: 80000 },
  { name: "Featured Dealer Banner", location: "Between vehicle listing rows", rate: 100000 },
  { name: "Category Page Banner", location: "Make and model pages", rate: 60000 },
  { name: "Sidebar Rectangle", location: "Desktop right rail", rate: 50000 },
  { name: "In-Feed Sponsored Listing", location: "Native card within search results", rate: 30000 },
  { name: "Sponsored Email Feature", location: "Weekly digest with 5,000+ subscribers", rate: 25000 },
  { name: "Dealer Profile Badge", location: "Sponsored branding on dealer pages", rate: 15000 },
];
const bundles = [
  { name: "Auto Finance Suite", includes: "Sidebar Rectangle + In-Feed Sponsored Listing + Sponsored Email Feature", rate: 90000, regular: 105000 },
  { name: "Dealer Dominance", includes: "Featured Dealer Banner + Dealer Profile Badge", rate: 105000, regular: 115000 },
  { name: "Brand Takeover", includes: "Hero Banner + Top Banner + Category Page Banner", rate: 230000, regular: 260000 },
  { name: "Premium Auto Pack", includes: "Hero Banner + In-Feed Sponsored Listing + Sponsored Email Feature", rate: 160000, regular: 175000 },
];
const businesses = [
  ["Banks & asset financiers", "Reach buyers exploring financing for their next vehicle."],
  ["Insurance companies", "Connect with buyers as they choose a vehicle and consider cover."],
  ["Automotive franchises", "Build brand awareness among people actively researching cars."],
  ["Auto finance providers", "Introduce financing options alongside vehicle discovery."],
  ["Tyre & battery brands", "Put your products in front of dealers, buyers and private sellers."],
  ["Service centres & garages", "Reach car owners looking for support beyond their purchase."],
];
const money = (value: number) => `KES ${value.toLocaleString("en-KE")}`;
const sectionClass = "mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8";

export default function AdvertiseWithUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className={"mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8"}>
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Corporate Advertising &amp; Partnerships</p>
            <h1 className="mt-4 max-w-4xl font-heading text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">Advertise with us</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">Connect your brand with thousands of buyers actively researching their next vehicle. Reach people comparing models, checking prices and arranging viewings across Kenya.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#contact-sales" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">Talk to our sales team</Link>
              <a href="#placement-preview" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">Preview placements</a>
            </div>
            <p className="mt-8 border-t border-gray-200 pt-5 text-sm leading-7 text-gray-600">50+ dealers · 15,000+ monthly visitors · 500+ live listings · Nationwide reach</p>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
              <Image src="/images/marketing/advertising-partnerships-hero.webp" alt="Advertising across Autolist marketplace screens and vehicle categories" fill priority sizes="(min-width: 1024px) 650px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-gray-900">Why advertise with Autolist?</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              ["A focused audience", "Reach people researching, comparing and buying vehicles, with your brand alongside their next decision."],
              ["Reach across Kenya", "Connect with buyers and sellers in Nairobi, Mombasa, Kisumu, Nakuru and Eldoret, and across the country."],
              ["Measurable results", "Campaign reporting covers impressions, clicks and leads, so you can understand what your advertising delivers."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className={sectionClass}>
            <h2 className="text-2xl font-semibold text-gray-900">Who you’ll reach</h2>
            <dl className="mt-7 grid grid-cols-2 gap-5 md:grid-cols-3">
              {audience.map(([value, label]) => <div key={label} className="rounded-xl bg-gray-50 p-5"><dt className="text-sm text-gray-600">{label}</dt><dd className="mt-2 text-2xl font-semibold text-gray-900">{value}</dd></div>)}
            </dl>
            <h3 className="mt-10 text-lg font-semibold text-gray-900">Buyer intent</h3>
            <dl className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
              {intent.map(([value, label]) => <div key={label}><dt className="text-sm leading-6 text-gray-600">{label}</dt><dd className="mt-2 text-2xl font-semibold text-primary">{value}</dd></div>)}
            </dl>
          </div>
        </section>

        <AdvertisingPlacementPreview placements={placements} />

        <section id="placements" className={`${sectionClass} scroll-mt-24`}>
          <h2 className="text-2xl font-semibold text-gray-900">Advertising placements</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">Choose where your brand appears. Rates below are per month.</p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {placements.map((placement) => <article key={placement.name} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6"><h3 className="text-lg font-semibold text-gray-900">{placement.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{placement.location}</p><p className="mt-6 text-xl font-semibold text-gray-900">{money(placement.rate)}<span className="block text-sm font-normal text-gray-500">per month</span></p><Link href="#contact-sales" className="mt-5 text-sm font-semibold text-primary hover:underline">Ask about this placement</Link></article>)}
          </div>
        </section>

        <section id="packages" className="scroll-mt-24 border-y border-gray-200 bg-white">
          <div className={sectionClass}>
            <h2 className="text-2xl font-semibold text-gray-900">Save with bundle packages</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">Combine placements to fit your goals. Savings compare the bundle with the individual monthly rates.</p>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {bundles.map((bundle) => <article key={bundle.name} className="rounded-xl border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{bundle.includes}</p><p className="mt-5 text-xl font-semibold text-gray-900">{money(bundle.rate)} <span className="text-sm font-normal text-gray-500">per month</span></p><p className="mt-2 text-sm font-medium text-primary">Save {money(bundle.regular - bundle.rate)} per month</p></article>)}
            </div>
            <p className="mt-6 text-sm leading-6 text-gray-600">Need a different combination? Our team can help build a package around your budget and objectives.</p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-2xl font-semibold text-gray-900">Who should advertise?</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map(([title, description]) => <div key={title}><h3 className="text-lg font-semibold text-gray-900">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></div>)}
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className={sectionClass}>
            <h2 className="text-2xl font-semibold text-gray-900">Getting started is simple</h2>
            <ol className="mt-7 grid gap-6 md:grid-cols-3">
              {[
                ["Choose your package", "Pick a placement or bundle. We’ll help you find the right fit for your campaign."],
                ["We design your ad", "Send your logo, brand guidelines and key message. Our team creates your ad at no extra cost."],
                ["Go live in 48 hours", "Once your creative is approved, your campaign goes live within 48 hours, with reporting on impressions, clicks and leads."],
              ].map(([title, description], index) => <li key={title}><p className="text-sm font-semibold text-primary">Step {index + 1}</p><h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{description}</p></li>)}
            </ol>
            <div className="mt-10 rounded-xl border border-brand-muted-border bg-brand-soft-surface p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-gray-900">Founding advertiser offer</h3>
              <p className="mt-3 text-base leading-7 text-gray-700">Get 30% off your first three months. Limited placements are available. Contact our sales team to claim the offer and confirm your placement.</p>
              <Link href="#contact-sales" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">Ask about the founding advertiser offer</Link>
            </div>
          </div>
        </section>

        <section id="contact-sales" className={`${sectionClass} scroll-mt-24`}>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Request a Media Kit</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">Tell us about your business and campaign. Our team will send the Media Kit and Rate Card within 24 hours and help you choose your placements.</p>
              <h3 className="mt-8 text-lg font-semibold text-gray-900">Talk to our sales team</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">Planning a single placement or a wider campaign? Send your brief directly to <a href="mailto:sales@autolist.co.ke" className="break-all font-medium text-primary underline underline-offset-4">sales@autolist.co.ke</a>.</p>
            </div>
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 sm:p-8"><AdvertisingInquiryForm /></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
