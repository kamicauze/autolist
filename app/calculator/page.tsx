"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, ShieldCheck, Clock, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Calculator,
    title: "Instant Calculation",
    description: "Get reliable monthly payment estimates in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Compare options",
    description: "Adjust rate and tenure to compare multiple finance scenarios.",
  },
  {
    icon: Clock,
    title: "No registration",
    description: "Use the tool freely without creating an account.",
  },
];

const tips = [
  {
    number: "1",
    title: "Larger deposit",
    description: "A higher down payment lowers your monthly repayments.",
  },
  {
    number: "2",
    title: "Check credit score",
    description: "Better credit often unlocks lower interest rates.",
  },
  {
    number: "3",
    title: "Compare deals",
    description: "Review offers from multiple lenders before committing.",
  },
  {
    number: "4",
    title: "Shorter terms",
    description: "Pay less total interest with shorter repayment periods.",
  },
];

function parseNumber(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function computeLoan({
  amount,
  downPayment,
  annualRate,
  years,
}: {
  amount: number;
  downPayment: number;
  annualRate: number;
  years: number;
}) {
  const principal = Math.max(amount - downPayment, 0);
  const months = Math.max(Math.round(years * 12), 1);

  if (principal <= 0) {
    return { monthly: 0, total: 0, interest: 0 };
  }

  if (annualRate <= 0) {
    const monthly = principal / months;
    return { monthly, total: principal, interest: 0 };
  }

  const monthlyRate = annualRate / 100 / 12;
  const monthly =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const total = monthly * months;
  const interest = total - principal;

  return { monthly, total, interest };
}

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = React.useState("5500000");
  const [downPayment, setDownPayment] = React.useState("700000");
  const [interestRate, setInterestRate] = React.useState("8.5");
  const [loanTermYears, setLoanTermYears] = React.useState("10");
  const [result, setResult] = React.useState(() =>
    computeLoan({ amount: 5500000, downPayment: 700000, annualRate: 8.5, years: 10 })
  );

  const currentInput = React.useMemo(
    () => ({
      amount: parseNumber(loanAmount),
      downPayment: parseNumber(downPayment),
      annualRate: parseNumber(interestRate),
      years: parseNumber(loanTermYears),
    }),
    [loanAmount, downPayment, interestRate, loanTermYears]
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeLoan(currentInput));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <PageHero label="AUTO LOAN CALCULATOR" heading="Calculate your monthly car loan payments">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-6 shadow-xl sm:p-8">
            <h3 className="text-lg font-bold text-foreground">Auto loan calculator</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter loan details and estimate your monthly repayment.
            </p>

            <form onSubmit={handleCalculate} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan-amount">Loan amount (Ksh)</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  placeholder="e.g. 5500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down payment (Ksh)</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    placeholder="e.g. 700000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-term-years">Loan term (years)</Label>
                <Input
                  id="loan-term-years"
                  type="number"
                  placeholder="e.g. 10"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="h-11 w-full text-sm font-semibold">
                Calculate Monthly Payment
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Estimated monthly payment</p>
                <p className="mt-1 text-3xl font-bold text-primary">Ksh {formatCurrency(result.monthly)}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-primary/10 pt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total payment</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">Ksh {formatCurrency(result.total)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total interest</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">Ksh {formatCurrency(result.interest)}</p>
                </div>
              </div>
            </div>
          </div>
        </PageHero>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Simple &amp; Free</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Plan financing confidently with straightforward repayment estimates.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Tips to Save Money</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {tips.map((tip) => (
                <div
                  key={tip.number}
                  className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {tip.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{tip.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eef4ff] py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to find your car?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Browse listings and apply your budget range using our full search filters.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-6 gap-2 border-primary text-primary">
              <Link href="/search">
                Browse cars
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
