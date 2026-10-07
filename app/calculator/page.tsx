import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Gauge, Search, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionNav, type GuideSectionLink } from "@/components/finance/section-nav";
import { AffordabilityCalculator } from "@/components/finance/affordability-calculator";
import { RepaymentCalculator } from "@/components/finance/repayment-calculator";
import { InsuranceFaq } from "@/components/finance/insurance-faq";
import {
  BulletList,
  DataTable,
  GuideSection,
  Note,
  Prose,
  Question,
  RecommendedReading,
} from "@/components/finance/guide-elements";

export const metadata: Metadata = {
  title: "Car Finance Guide & Affordability Calculator | Autolist",
  description:
    "How car finance works in Kenya: bank, Sacco and dealer loans, deposits, CRB checks, running costs and insurance, with calculators for your budget and monthly repayments.",
};

const sections: GuideSectionLink[] = [
  { id: "before-you-buy", label: "Before you buy" },
  { id: "loan-options", label: "Loan options" },
  { id: "finance-tips", label: "Finance tips" },
  { id: "payment-plans", label: "Payment plans" },
  { id: "affordability", label: "Affordability" },
  { id: "repayments", label: "Repayments" },
  { id: "hidden-costs", label: "Hidden costs" },
  { id: "insurance", label: "Insurance" },
];

const keyNumbers = [
  { figure: "15%", detail: "of gross monthly income: the most your total car costs should take" },
  { figure: "20–50%", detail: "deposit most Kenyan banks ask for" },
  { figure: "80%", detail: "of a used car's value is the most banks typically finance" },
  { figure: "KES 1,800", detail: "a month (approx.) for tracking, required on financed cars" },
];

const DISCLAIMER =
  "Figures on this page are estimates for guidance only. They are not a loan offer or financial advice. Rates, fees and terms vary by lender and change over time, so confirm the details with your bank, Sacco or insurer.";

export default function CarFinancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="border-b border-border bg-brand-tint">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Tools & services" }, { label: "Car finance" }]}
            />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Car finance in Kenya
            </h1>
            <p className="mt-3 max-w-prose text-lg leading-8 text-foreground/80">
              How car loans work, what lenders check and how much car your income can carry. Test
              your numbers here before you speak to a bank, Sacco or dealer.
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <Button asChild>
                <a href="#affordability">
                  <Gauge />
                  Check what I can afford
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#repayments">
                  <Calculator />
                  Estimate repayments
                </a>
              </Button>
            </div>
          </div>
        </div>

        <SectionNav sections={sections} />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
          <div className="flex min-w-0 flex-col gap-12">
            <GuideSection id="before-you-buy" eyebrow="Before you buy" title="Start with a plan">
              <Prose>
                Asset finance can feel overwhelming, whether you want a new car or a clean
                foreign-used import. There are many lenders and products, and plenty of local rules
                to weigh up.
              </Prose>
              <Prose>
                This guide covers the main ways to finance a car in Kenya, what lenders look for, how
                payment plans differ and the costs that follow once you drive off. Whether it is your
                first car from a showroom or an upgrade from a local yard, the goal is the same: a
                deal you can comfortably repay.
              </Prose>
              <Note>
                Work out your budget first, then shop. Knowing your limit puts you in a stronger
                position with lenders and sellers.
              </Note>
            </GuideSection>

            <GuideSection id="loan-options" eyebrow="Loan options" title="What are my car loan options?">
              <Prose>
                Start by understanding the main types of asset finance on offer in Kenya.
              </Prose>

              <Question>Should I get a bank loan?</Question>
              <Prose>
                Tier-1 and tier-2 banks offer structured repayment terms, which makes them a popular
                choice. Expect a slower process: you will need certified bank statements as proof of
                income, KRA PIN verification and a strict credit check.
              </Prose>

              <Question>Is dealership financing a good idea?</Question>
              <Prose>
                Many yards have financing partners, so you can arrange the loan where you buy the
                car. It is usually faster and easier to qualify for, but compare the partner
                bank&apos;s interest rate and processing fees with independent lenders before you
                sign.
              </Prose>

              <Question>What about digital and micro-finance lenders?</Question>
              <Prose>
                Online applications and quick approvals have made these lenders popular. They accept
                a wider range of credit profiles, including people with informal income, but usually
                charge a higher interest rate.
              </Prose>

              <Question>What is the total cost of credit?</Question>
              <Prose>
                The interest rate is only part of the cost. Ask every lender for a full breakdown
                that includes:
              </Prose>
              <BulletList
                items={[
                  "Tracking device installation",
                  "Comprehensive insurance premiums",
                  "Valuation fees",
                  "Negotiation fees",
                ]}
              />
              <Prose>
                Compare offers on the total, not the headline rate, and pick a loan that fits your
                monthly income.
              </Prose>

              <RecommendedReading
                href="/valuation"
                icon={Search}
                title="Value your vehicle"
                description="Know what a car is worth before you agree a price or apply for finance."
              />
            </GuideSection>

            <GuideSection id="finance-tips" eyebrow="Finance tips" title="How do I improve my chances of approval?">
              <Question>Why does my CRB status matter?</Question>
              <Prose>
                Lenders use your Credit Reference Bureau (CRB) report to judge your eligibility and
                risk. A clean report usually means a smoother approval and more room to negotiate. If
                you have a negative listing or a past default, clear it and get a CRB clearance
                certificate before you apply.
              </Prose>

              <Question>How much deposit do I need?</Question>
              <Prose>
                Most Kenyan banks ask for 20% to 50% of the car&apos;s value, depending on whether it
                is a locally used unit or a fresh import. A bigger deposit:
              </Prose>
              <BulletList
                items={[
                  "Reduces the amount you need to borrow",
                  "Lowers your monthly instalments and total interest",
                  "Shows lenders you can manage money, which can earn better terms",
                ]}
              />

              <Question>Should I get pre-approved?</Question>
              <Prose>
                Compare several lenders and ask for a pre-approval letter. It shows your realistic
                budget and gives you a stronger hand when you negotiate the price with a dealer or
                private seller.
              </Prose>

              <RecommendedReading
                href="#affordability"
                icon={Gauge}
                title="Work out what you can afford"
                description="Turn your income, debts and deposit into a realistic price ceiling."
              />
            </GuideSection>

            <GuideSection id="payment-plans" eyebrow="Payment plans" title="Which payment plan suits me?">
              <Prose>
                Choose a repayment structure that fits your cash flow and your plans for the car.
              </Prose>

              <Question>What is a reducing-balance loan?</Question>
              <Prose>
                Interest is charged on the outstanding principal each month. As you pay the loan
                down, the interest portion falls, so extra lump-sum payments that clear the loan
                early save you money.
              </Prose>

              <Question>What is a fixed-rate loan?</Question>
              <Prose>
                The interest rate stays the same for the whole term. Your instalment is predictable
                and does not change when the Central Bank Rate (CBR) moves.
              </Prose>

              <Question>How does hire purchase work?</Question>
              <Prose>
                Hire purchase and micro-asset finance are common with commercial drivers, such as
                taxi and delivery businesses, and with specialised asset finance companies. Entry
                requirements are often lower, but total interest can be higher and repossession
                terms stricter if you miss a payment.
              </Prose>

              <Question>Can I finance a car through my Sacco?</Question>
              <Prose>
                Saccos offer some of the most competitive vehicle loans in Kenya. Using your Sacco
                multiplier, often 3 to 4 times your shares, you can borrow at lower and more stable
                rates than commercial banks. The car may not need to be tracked or held under strict
                bank ownership terms.
              </Prose>

              <Question>Should I use a personal loan instead?</Question>
              <Prose>
                With asset finance, the bank holds the logbook as collateral. An unsecured personal
                loan does not, so you can also use the money for the first year&apos;s comprehensive
                insurance, NTSA logbook transfer fees or a mechanical service. Compare rates and terms
                from your salary bank first.
              </Prose>

              <Note>
                Whichever route you choose, base the decision on your monthly cash flow, not only on
                the car you want.
              </Note>
            </GuideSection>

            <GuideSection id="affordability" eyebrow="Affordability" title="How much car can I afford?">
              <Prose>
                A sensible rule in Kenya is to keep total car costs (loan, fuel, insurance,
                maintenance and parking) within 15% of your gross monthly income. That is stricter
                than the 20% often quoted in South Africa because fuel and maintenance cost more here.
              </Prose>
              <Prose>
                The calculator takes 15% of your income, subtracts debts you already repay, then
                keeps 30% aside for running costs. What is left is the most your loan instalment
                should be.
              </Prose>

              <div className="mt-6">
                <AffordabilityCalculator />
              </div>

              <Question>What else limits how much I can borrow?</Question>
              <BulletList
                items={[
                  "Banks typically finance up to 80% of a used car's value, so plan for at least a 20% deposit.",
                  "Some banks cap used-car loans at 48 months and new-car loans at 60 months; a few go to 72.",
                  "Some lenders will not finance cars older than about 8 years.",
                  "Lenders generally expect total loan repayments to stay under two-thirds of your basic pay.",
                ]}
              />
              <p className="mt-4 max-w-prose text-xs leading-5 text-muted-foreground">{DISCLAIMER}</p>
            </GuideSection>

            <GuideSection id="repayments" eyebrow="Repayments" title="What will my monthly repayment be?">
              <Prose>
                Already have a car in mind? Enter its price, your deposit, the interest rate and the
                term to estimate your monthly instalment and the interest you will pay.
              </Prose>

              <div className="mt-6">
                <RepaymentCalculator />
              </div>

              <Question>What interest rate should I use?</Question>
              <Prose>
                Indicative ranges to test with. For reference, the Central Bank Rate (CBR) was 8.75%
                when this guide was written.
              </Prose>
              <DataTable
                caption="Typical car loan interest rates in Kenya"
                columns={["Loan type", "Typical rate"]}
                rows={[
                  ["New vehicle (bank)", "5% to 12% a year"],
                  ["Used vehicle (bank)", "8% to 15% a year"],
                  ["Logbook loan", "3.5% to 5.17% a month"],
                ]}
              />
              <p className="mt-4 max-w-prose text-xs leading-5 text-muted-foreground">
                Estimates assume a fixed rate and equal monthly instalments. {DISCLAIMER}
              </p>
            </GuideSection>

            <GuideSection id="hidden-costs" eyebrow="Hidden costs" title="What does it cost to run a financed car?">
              <Prose>
                Your instalment is only part of the monthly bill. Budget for these running costs too:
              </Prose>
              <DataTable
                caption="Estimated monthly running costs"
                columns={["Cost", "Estimate (KES a month)", "Basis"]}
                rows={[
                  ["Fuel", "8,000 to 15,000", "About 20,000 km a year at current fuel prices"],
                  ["Insurance", "3,000 to 8,000", "3.8% to 5% of the car's value a year"],
                  ["Maintenance", "2,000 to 5,000", "Servicing, tyres and repairs"],
                  ["Tracking", "About 1,800", "Required for financed vehicles"],
                  ["Parking", "2,000 to 5,000", "Urban areas"],
                ]}
                footer={["Total", "16,800 to 34,800", "Before your loan instalment"]}
              />

              <Question>What one-off costs should I plan for?</Question>
              <Prose>
                Before the car is yours, set aside cash for lender processing and valuation fees,
                tracking device installation, the first year&apos;s comprehensive insurance and NTSA
                logbook transfer fees.
              </Prose>

              <RecommendedReading
                href="/insurance"
                icon={ShieldCheck}
                title="Get car insurance quotes"
                description="Compare comprehensive cover for a financed car before you collect it."
              />
            </GuideSection>

            <GuideSection id="insurance" eyebrow="Insurance" title="What insurance does a financed car need?">
              <Prose>
                Every vehicle on Kenyan roads needs insurance, and a car on finance needs more than
                the legal minimum.
              </Prose>

              <Question>What types of cover are there?</Question>
              <DataTable
                caption="Types of motor insurance in Kenya"
                columns={["Type", "What it covers"]}
                rows={[
                  [
                    "Third Party Only",
                    "Injury, death or property damage to other people and their vehicles. Does not cover your own car or your injuries.",
                  ],
                  [
                    "Third Party, Fire & Theft",
                    "Everything in Third Party, plus your car if it is stolen or damaged by fire.",
                  ],
                  [
                    "Comprehensive",
                    "Third-party liability, theft, fire and damage to your own car, including collision, vandalism, weather and falling objects.",
                  ],
                ]}
              />
              <Note>Most banks that finance cars in Kenya require comprehensive cover.</Note>

              <Question>Is car insurance mandatory?</Question>
              <Prose>
                Yes. Every vehicle on Kenyan roads must have at least Third Party cover under the
                Insurance Act (Cap 487). Without it you are also personally liable for any accident
                damages.
              </Prose>
              <DataTable
                caption="Penalties for driving without insurance"
                columns={["Offence", "Penalty"]}
                rows={[
                  [
                    "Driving with no insurance",
                    "Fine of up to KES 1 million, up to 1 year in prison, or both. The vehicle can be impounded.",
                  ],
                  [
                    "Failing to produce an insurance certificate",
                    "Fine of up to KES 20,000 or up to 6 months in prison.",
                  ],
                ]}
              />
              <Prose>
                Police at roadblocks routinely ask for your insurance certificate. A digital copy on
                your phone is accepted under the Traffic Act amendments.
              </Prose>

              <Question>Can I insure a financed car?</Question>
              <Prose>
                Yes, and your lender sets the terms. With a car loan from a bank such as Equity, KCB,
                Co-op or NCBA, expect to need:
              </Prose>
              <BulletList
                items={[
                  "Comprehensive cover for the full value of the car",
                  "The bank named as loss payee on the policy",
                  "An endorsement that protects the bank's interest",
                ]}
              />
              <Prose>
                You cannot cancel the policy without the bank&apos;s consent until the loan is repaid.
              </Prose>

              <Question>Which cover should I choose?</Question>
              <DataTable
                caption="Recommended minimum cover by vehicle type"
                columns={["Your vehicle", "Recommended minimum cover"]}
                rows={[
                  ["Old personal car (high mileage, low value)", "Third Party, Fire & Theft"],
                  ["New or financed car", "Comprehensive"],
                  ["Boda boda or tuk tuk", "Comprehensive or a specialised motorcycle policy"],
                  ["Matatu or taxi", "Comprehensive with a PSV (Public Service Vehicle) endorsement"],
                  ["Rare or collector car", "Agreed-value comprehensive"],
                ]}
              />

              <Question>More insurance questions</Question>
              <InsuranceFaq />

              <Note>
                Never choose a policy on price alone. A cheap policy with slow claims or a limited
                garage network can cost you more. Read reviews, ask for referrals and always read the
                exclusions before you sign.
              </Note>
            </GuideSection>
          </div>

          <aside className="hidden lg:block" aria-label="Key numbers">
            <div className="sticky top-32 rounded-2xl border border-border bg-card p-5 shadow-sm xl:top-40">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Key numbers</h2>
              <dl className="mt-4 space-y-4">
                {keyNumbers.map((item) => (
                  <div key={item.figure}>
                    <dt className="text-xl font-bold text-foreground tabular-nums">{item.figure}</dt>
                    <dd className="mt-0.5 text-sm leading-5 text-muted-foreground">{item.detail}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
                <Button asChild size="sm">
                  <a href="#affordability">Check what I can afford</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href="#repayments">Estimate repayments</a>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <section className="bg-brand-tint py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to find your next car?</h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground/80">
              Browse new and foreign-used vehicles across Kenya, then line up insurance before you
              collect the keys.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/search">
                  Browse listings
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/insurance">
                  <ShieldCheck />
                  Get an insurance quote
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
