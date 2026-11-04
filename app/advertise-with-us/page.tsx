import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdvertisingInquiryForm } from "@/components/shared/advertising-inquiry-form";

import { AdvertisingPlacementPreview } from "@/components/shared/advertising-placement-preview";

export const metadata: Metadata = {
  title: "Advertise With Autolist Kenya | Reach Car Buyers Nationwide",
  description: "Partner with Autolist Kenya to reach high-intent car buyers. Discuss possible banner placements and sponsorships with our team during the free dealer pilot.",
};

const placements = [
  { name: "Hero Banner", location: "Homepage, above the fold" },
  { name: "Top Banner", location: "Homepage, below the search bar" },
  { name: "Featured Dealer Banner", location: "Between vehicle listing rows" },
  { name: "Category Page Banner", location: "Relevant search results, subject to availability" },
  { name: "Sidebar Rectangle", location: "Desktop right rail" },
  { name: "In-Feed Sponsored Listing", location: "Native card within search results" },
  { name: "Sponsored Email Feature", location: "Email placement subject to audience and delivery confirmation" },
  { name: "Dealer Profile Badge", location: "Sponsored branding on dealer pages" },
];
const businesses = [
  ["Banks & asset financiers", "Reach buyers exploring financing for their next vehicle."],
  ["Insurance companies", "Connect with buyers as they choose a vehicle and consider cover."],
  ["Automotive franchises", "Build brand awareness among people actively researching cars."],
  ["Auto finance providers", "Introduce financing options alongside vehicle discovery."],
  ["Tyre & battery brands", "Put your products in front of dealers, buyers and private sellers."],
  ["Service centres & garages", "Reach car owners looking for support beyond their purchase."],
];
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
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">Discuss advertising and partnership opportunities alongside vehicle browsing. Our team can confirm available placements, campaign scope and reporting before you commit.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#contact-sales" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">Talk to our sales team</Link>
              <a href="#placement-preview" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">Preview placements</a>
            </div>
            <p className="mt-8 border-t border-gray-200 pt-5 text-sm leading-7 text-gray-600">Autolist is running a free dealer pilot. Paid dealer packages are paused; corporate advertising enquiries are reviewed separately.</p>
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
              ["Agree your campaign scope", "Ask the team to confirm available placements, reporting and delivery terms for your campaign."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <AdvertisingPlacementPreview placements={placements} />

        <section id="placements" className={`${sectionClass} scroll-mt-24`}>
          <h2 className="text-2xl font-semibold text-gray-900">Advertising placements</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">These examples illustrate possible placements. Availability, pricing and delivery must be confirmed with the team; submitting an enquiry does not purchase a campaign.</p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {placements.map((placement) => <article key={placement.name} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6"><h3 className="text-lg font-semibold text-gray-900">{placement.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{placement.location}</p><Link href="#contact-sales" className="mt-5 text-sm font-semibold text-primary hover:underline">Ask about this placement</Link></article>)}
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
                ["Share your brief", "Tell us your goals, audience and preferred placement."],
                ["Confirm the details", "Agree availability, creative requirements, pricing and reporting with our team."],
                ["Agree a launch date", "Launch timing and delivery depend on the agreed campaign and approved creative."],
              ].map(([title, description], index) => <li key={title}><p className="text-sm font-semibold text-primary">Step {index + 1}</p><h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{description}</p></li>)}
            </ol>

          </div>
        </section>

        <section id="contact-sales" className={`${sectionClass} scroll-mt-24`}>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Request a Media Kit</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">Tell us about your business and campaign. Our team will follow up to discuss available placements and campaign details.</p>
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
