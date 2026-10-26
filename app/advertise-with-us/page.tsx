import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CorporateInquiryForm } from "@/components/shared/corporate-inquiry-form";

export const metadata: Metadata = {
  title: "Advertise with us | Autolist",
  description: "Talk to Autolist about corporate advertising, brand collaborations and partnerships in Kenya's vehicle marketplace.",
};

const reasons = [
  { title: "Reach people researching their next vehicle", description: "Introduce your brand alongside vehicle discovery, comparisons, news and reviews." },
  { title: "Connect with the automotive community", description: "Explore opportunities relevant to buyers, private sellers, dealerships and automotive businesses in Kenya." },
  { title: "Find a placement that fits your goals", description: "Discuss homepage, category and editorial opportunities with our team, including availability and campaign requirements." },
  { title: "Build a partnership around your business", description: "Bring us your ideas for brand collaborations, useful content and services that support the vehicle buying and selling journey." },
];

export default function AdvertiseWithUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Corporate Advertising &amp; Partnerships</p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">Advertise with us</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">Connect your brand with people exploring vehicles across Kenya. Let’s discuss advertising, brand collaborations and strategic opportunities that fit your business.</p>
            <Link href="#contact-sales" className="mt-7 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90">Talk to our sales team</Link>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900">Why partner with Autolist?</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {reasons.map((reason) => (
              <article key={reason.title} className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-gray-900">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{reason.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="contact-sales" className="scroll-mt-24 border-t border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Let’s create value together</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">Share your email and our sales team can get in touch. You can also send your campaign brief directly to <a href="mailto:sales@autolist.co.ke" className="font-medium text-primary underline underline-offset-4">sales@autolist.co.ke</a>.</p>
            </div>
            <div className="max-w-xl"><CorporateInquiryForm /></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
