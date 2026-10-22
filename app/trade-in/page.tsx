import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Trading In Your Car in Kenya: A Complete Guide | Autolist",
  description:
    "Understand trade-in offers, how dealers assess your car, and how to compare your options before choosing your next vehicle.",
};

export default function TradeInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#f8fafc]">
        <section className="border-b border-[#e5e7eb] bg-white">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trade-In</p>
            <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-[#111827] sm:text-[40px]">
              Trading In Your Car in Kenya: A Complete Guide
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#475467]">
              Trading in can make changing your car more convenient. Understand how an offer is calculated,
              compare it with a private sale, and agree the details before handing over your vehicle.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <article className="space-y-8 rounded-3xl border border-[#e5e7eb] bg-white p-6 text-base leading-7 text-[#475467] shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-10 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#111827] [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            <section>
              <h2>What is a trade-in?</h2>
              <p>
                A trade-in is an arrangement where a dealer offers you an amount for your current car
                and deducts that amount from the price of the replacement vehicle you buy from them.
                You agree both the value of your current car and the price of your next one with the dealer.
              </p>
            </section>

            <section>
              <h2>Trading in or selling privately</h2>
              <p>
                Trading in is often quicker and more convenient because one dealer handles the sale and
                replacement purchase. You avoid advertising your car, vetting prospective buyers, and
                arranging separate viewings.
              </p>
              <p>
                A private sale may achieve a higher price, but it takes more time and effort. A trade-in
                offer is usually lower because the dealer needs to prepare the vehicle for resale and
                cover their costs. Consider both the amount offered and the convenience of the arrangement.
              </p>
            </section>

            <section>
              <h2>How a dealer assesses your car</h2>
              <p className="mb-3">The dealer will inspect the car and consider factors including:</p>
              <ul>
                <li>Physical condition, wear, cleanliness, and any visible damage.</li>
                <li>Make, model, and current market demand for similar vehicles.</li>
                <li>Mileage in relation to the vehicle&apos;s age.</li>
                <li>Body colour, features, and optional extras.</li>
                <li>Service history and supporting maintenance records.</li>
              </ul>
              <p className="mt-3">
                Bring your full service history and be clear about the vehicle&apos;s condition so the dealer
                can assess it accurately.
              </p>
            </section>

            <section>
              <h2>Why the offer is lower than a retail price</h2>
              <p>
                The trade value is what the dealer pays for a vehicle. The retail value is the price at
                which the dealer offers it to the next buyer. The difference helps cover business overheads,
                preparation costs, and a profit margin.
              </p>
              <p className="mb-3">Preparation can include:</p>
              <ul>
                <li>Cleaning and cosmetic work.</li>
                <li>Repairs to bodywork, glass, or wheels.</li>
                <li>Mechanical repairs and servicing.</li>
                <li>Replacement tyres and other work needed before resale.</li>
              </ul>
            </section>

            <section>
              <h2>Shop around and compare the whole deal</h2>
              <p>
                Compare similar cars on the market to understand the advertised price range, allowing for
                differences in age, mileage, and condition. Advertised retail prices provide context;
                they do not guarantee the same amount as a trade-in offer.
              </p>
              <p>
                Ask more than one dealer for a quote and negotiate where appropriate. Compare the trade-in
                offer alongside the replacement car&apos;s price and the balance you would pay, so you can
                assess the complete deal.
              </p>
            </section>

            <section>
              <h2>If your car has outstanding finance</h2>
              <p>
                Confirm the settlement amount with your lender before agreeing a trade-in. Agree with the
                lender and dealer how that balance will be settled. Any remaining value may be paid to you
                or used as a deposit towards your replacement vehicle, according to the agreed terms.
              </p>
              <p>
                If the settlement amount exceeds the offer, confirm how the shortfall will be covered
                before proceeding. Check the vehicle&apos;s finance position, including any liens or
                hire-purchase obligations, even when it is described as paid off.
              </p>
            </section>

            <section>
              <h2>Before you agree</h2>
              <p>
                Prepare your records, compare offers, and make sure the car&apos;s condition, any finance
                settlement, the replacement price, and the amount left to pay are clear. A trade-in can
                save time when the complete arrangement suits your needs.
              </p>
            </section>
          </article>

          <section className="mt-8 rounded-3xl border border-brand-muted-border bg-brand-tint/50 p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold text-[#111827]">Ready to speak to a dealer?</h2>
            <p className="mt-3 text-base leading-7 text-[#475467]">
              Use Autolist to request offers for your vehicle or find a dealer to discuss a replacement
              and a possible trade-in. Agree the vehicle price, payment, and any finance settlement directly
              with the dealer and lender.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild><Link href="/sell/dealer">Get dealer offers</Link></Button>
              <Button asChild variant="outline"><Link href="/dealers">Find a dealer</Link></Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
