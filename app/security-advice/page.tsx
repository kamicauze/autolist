import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CarFront,
  FileCheck2,
  HandCoins,
  KeyRound,
  MapPin,
  MessageSquareWarning,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Security Advice | Autolist",
  description: "Advice on how to buy and sell vehicles safely in Kenya.",
};

const buyerChecklist = [
  {
    icon: SearchCheck,
    title: "Check the listing details",
    description:
      "Compare the photos, mileage, year, number plate visibility, chassis/VIN details, and price against similar vehicles before you arrange a viewing.",
  },
  {
    icon: BadgeCheck,
    title: "Verify the seller",
    description:
      "Prefer verified dealers or complete seller profiles. Be cautious if the contact details keep changing or the seller avoids normal Autolist messaging steps.",
  },
  {
    icon: MapPin,
    title: "Meet in a safe place",
    description:
      "View the car during the day in a public location, showroom, garage, or trusted inspection centre. Bring someone with you when possible.",
  },
  {
    icon: FileCheck2,
    title: "Inspect documents",
    description:
      "Confirm the logbook, owner identity, import documents, service history, and any financing or insurance records before paying a deposit.",
  },
];

const sellerChecklist = [
  {
    icon: CarFront,
    title: "Keep the deal on record",
    description:
      "Use Autolist enquiries and messages where possible so there is a clear record of buyer questions, agreed viewing details, and offer history.",
  },
  {
    icon: KeyRound,
    title: "Control test drives",
    description:
      "Verify the buyer's licence, keep a copy of their contact details, and accompany every test drive. Do not hand over keys before payment clears.",
  },
  {
    icon: HandCoins,
    title: "Confirm payment first",
    description:
      "Avoid pressure to release a vehicle on screenshots, cheque promises, or pending transfers. Confirm cleared funds with your bank or payment provider.",
  },
  {
    icon: MessageSquareWarning,
    title: "Watch for pressure tactics",
    description:
      "Pause if a buyer asks you to rush paperwork, ship the car before payment, use unusual payment channels, or move the conversation to suspicious links.",
  },
];

const warningSigns = [
  "A price that is far below market value without a clear reason.",
  "Requests to pay a deposit before seeing the vehicle or documents.",
  "A seller who refuses inspection, video calls, or normal identity checks.",
  "Payment screenshots, overpayment stories, or refund requests before funds clear.",
  "Pressure to click unfamiliar links or continue the deal outside normal contact channels.",
  "Documents where the names, chassis/VIN, number plate, or vehicle details do not match.",
];

export default function SecurityAdvicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <PageHero
          label="Security advice"
          heading="Buy and sell vehicles with more confidence"
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Autolist safety basics
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                Simple checks reduce most vehicle deal risks.
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Autolist connects buyers, private sellers, and dealers, but vehicle
                payments and ownership transfers happen between the parties. Use
                these checks before you view, pay for, release, or transfer a car.
              </p>
              <div className="mt-6 rounded-lg border border-primary/15 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-gray-700">
                    If something feels wrong, stop the transaction, keep the
                    conversation record, and report the listing or enquiry for review.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {buyerChecklist.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-gray-50 py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Selling safely
                </p>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">
                  Protect your vehicle, documents, and payment.
                </h2>
                <p className="mt-4 text-sm leading-7 text-gray-600">
                  A genuine buyer should be comfortable with verification,
                  inspection, clear payment steps, and written transfer records.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {sellerChecklist.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-lg border border-gray-200 bg-white p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Warning signs</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {warningSigns.map((sign) => (
                <div key={sign} className="flex gap-3 text-sm leading-6 text-gray-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{sign}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Stay on Autolist
              </p>
              <h2 className="mt-2 text-2xl font-bold">Start with verified listings and clear seller details.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Browse listings
              </Link>
              <Link
                href="/sell"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sell your car
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
