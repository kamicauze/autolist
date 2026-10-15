import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CarFront,
  FileCheck2,
  FileLock2,
  HandCoins,
  KeyRound,
  MapPin,
  MessageSquareWarning,
  MailWarning,
  SearchCheck,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageHero } from "@/components/shared/page-hero";
import { Icon3D, Illustration3D } from "@/components/ui/icon-3d";

export const metadata: Metadata = {
  title: "Security Advice | Autolist",
  description: "Advice on how to buy and sell vehicles safely in Kenya.",
};

const buyerChecklist = [
  {
    icon: SearchCheck,
    asset: "listing-inspect",
    title: "Check the listing details",
    description:
      "Compare photos, mileage, year, chassis/VIN details and price against similar vehicles. Inspect the vehicle and its original documents in person before paying a deposit or holding fee.",
  },
  {
    icon: BadgeCheck,
    asset: "verified-badge",
    title: "Verify the seller",
    description:
      "Prefer verified dealers or complete seller profiles. Be cautious if the contact details keep changing or the seller avoids normal Autolist messaging steps.",
  },
  {
    icon: MapPin,
    asset: "map-pin",
    title: "Meet in a safe place",
    description:
      "View the car during the day in a public location, showroom, garage, or trusted inspection centre. Bring someone with you when possible.",
  },
  {
    icon: FileCheck2,
    asset: "document-check",
    title: "Inspect documents",
    description:
      "Confirm the logbook, owner identity, import documents, service history, and any financing or insurance records before paying a deposit.",
  },
] as const;

const sellerChecklist = [
  {
    icon: CarFront,
    asset: "car-front",
    title: "Keep the deal on record",
    description:
      "Use Autolist enquiries and messages where possible so there is a clear record of buyer questions, agreed viewing details, and offer history.",
  },
  {
    icon: KeyRound,
    asset: "car-keys",
    title: "Control test drives",
    description:
      "Check the buyer's driving licence in person, agree a familiar route and accompany every test drive. Remove valuables, keep track of the keys and decline a drive if you feel unsafe.",
  },
  {
    icon: HandCoins,
    asset: "cash-hand",
    title: "Confirm payment first",
    description:
      "Confirm cleared funds directly with your bank or payment provider. Do not release the vehicle on a payment screenshot, pending transfer or unverified cheque, and never refund an alleged overpayment before funds are verified.",
  },
  {
    icon: FileLock2,
    asset: "document-lock",
    title: "Protect your listing photos",
    description:
      "Cover number plates and remove personal documents, addresses and valuables from listing photos. Show identity and ownership documents in person rather than sending copies in messages.",
  },
  {
    icon: MessageSquareWarning,
    asset: "chat-warning",
    title: "Watch for pressure tactics",
    description:
      "Pause if a buyer asks you to rush paperwork, ship the car before payment, use unusual payment channels, or move the conversation to suspicious links.",
  },
] as const;

const warningSigns = [
  "A price that is far below market value without a clear reason.",
  "Requests to pay a deposit before seeing the vehicle or documents.",
  "A seller who refuses inspection, video calls, or normal identity checks.",
  "Payment screenshots, overpayment stories, or refund requests before funds clear.",
  "Pressure to click unfamiliar links or continue the deal outside normal contact channels.",
  "Documents where the names, chassis/VIN, number plate, or vehicle details do not match.",
  "Elaborate import-agent stories, repeated excuses to avoid a viewing, or pressure to use an unfamiliar payment service.",
];

const documentChecks = [
  "Ask to see the original logbook and confirm that the owner name and vehicle details match.",
  "Check the chassis/VIN, number plate, make, model, and colour against the vehicle and paperwork.",
  "Confirm ownership and registration information through the official NTSA/eCitizen process before payment.",
  "Do not send copies of your National ID, passport, logbook, KRA PIN, or banking information through ordinary messages.",
];

const fraudResponse = [
  "Stop communicating and do not send additional money or documents.",
  "Preserve the listing URL, enquiry history, receipts, phone numbers, and screenshots.",
  "Use the listing report control so the Autolist team can review the account and advertisement.",
  "Change your Autolist and email passwords if you entered credentials on a suspicious page.",
  "Contact your bank or payment provider immediately if money or payment credentials may be at risk.",
  "Report financial loss, theft, threats, or identity misuse to the appropriate Kenyan authorities.",
];

export default function SecurityAdvicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <PageHero
          label="Security advice"
          heading="Buy and sell vehicles with more confidence"
          backgroundImage="/security-vehicle-check.jpg"
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
                  <Icon3D icon={ShieldCheck} size="sm" />
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
                  <Illustration3D
                    asset={item.asset}
                    fallbackIcon={item.icon}
                    size="md"
                    className="flex"
                  />
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

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" aria-labelledby="communication-safety">
          <div className="grid gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8 md:grid-cols-2">
            <div>
              <h2 id="communication-safety" className="text-2xl font-bold text-gray-900">Keep a clear communication record</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Use Autolist enquiries and messages to retain questions, viewing arrangements and agreed terms.
                Be cautious when someone immediately asks you to move elsewhere, follow an unfamiliar link or
                share financial information. A verified badge does not replace inspecting the vehicle,
                checking documents or confirming payment.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report pressure, harassment or suspicious requests</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Stop contact if someone is aggressive, asks for sensitive documents or demands an advance
                payment before inspection. Use the listing report control and keep the listing link and
                message record. Email{" "}
                <a href="mailto:safety@autolist.co.ke" className="font-semibold text-brand-link underline underline-offset-4">safety@autolist.co.ke</a>
                {" "}with the details so the team can review the concern.
              </p>
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
                    <Illustration3D
                      asset={item.asset}
                      fallbackIcon={item.icon}
                      size="md"
                      className="flex"
                    />
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

        <section className="border-y border-gray-100 bg-gray-50 py-12 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <article className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
              <Illustration3D
                asset="document-lock"
                fallbackIcon={FileLock2}
                size="md"
                className="flex h-11 w-11"
              />
              <h2 className="mt-5 text-2xl font-bold text-gray-900">Verify documents in person</h2>
              <ul className="mt-5 space-y-3">
                {documentChecks.map((check) => (
                  <li key={check} className="flex gap-3 text-sm leading-6 text-gray-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://accounts.ecitizen.go.ke/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm font-semibold text-brand-link underline underline-offset-4"
              >
                Open the official eCitizen portal
              </a>
            </article>

            <article className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
              <Illustration3D
                asset="phishing-mail"
                fallbackIcon={MailWarning}
                size="md"
                className="flex h-11 w-11"
              />
              <h2 className="mt-5 text-2xl font-bold text-gray-900">Avoid phishing and fake Autolist messages</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Type <strong>autolist.co.ke</strong> directly into your browser. Be suspicious of messages
                that create urgency, ask you to reveal a password or one-time code, or send you to an
                unfamiliar login or payment page.
              </p>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Autolist will not ask you by email, SMS, or WhatsApp to send a vehicle purchase payment,
                reveal your password, or refund an alleged overpayment. Platform charges cover Autolist
                services only.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Illustration3D
                asset="fraud-siren"
                fallbackIcon={Siren}
                size="md"
                tone="danger"
                className="h-11 w-11"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">If you suspect fraud</h2>
                <ol className="mt-5 space-y-3">
                  {fraudResponse.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-gray-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-red-600">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-sm leading-6 text-gray-700">
                  For Platform support, email{" "}
                  <a
                    href="mailto:support@autolist.co.ke"
                    className="font-semibold text-brand-link underline underline-offset-4"
                  >
                    support@autolist.co.ke
                  </a>
                  .
                </p>
              </div>
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
