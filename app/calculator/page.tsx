"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  ShieldCheck,
  Clock,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const benefits = [
  {
    icon: Calculator,
    title: "Simple & Accurate",
    description:
      "Our calculator uses standard amortization formulas to give you precise monthly payment estimates.",
  },
  {
    icon: ShieldCheck,
    title: "No Sign-Up Required",
    description:
      "Use the calculator freely without creating an account or sharing personal information.",
  },
  {
    icon: Clock,
    title: "Instant Results",
    description:
      "Get your estimated monthly payments in seconds. Adjust inputs and recalculate as many times as you want.",
  },
];

const tips = [
  {
    number: "1",
    title: "Make a Larger Down Payment",
    description:
      "A bigger down payment reduces your loan amount, lowering both monthly payments and total interest paid.",
  },
  {
    number: "2",
    title: "Choose a Shorter Loan Term",
    description:
      "While monthly payments are higher, you'll pay significantly less in total interest over the life of the loan.",
  },
  {
    number: "3",
    title: "Improve Your Credit Score",
    description:
      "A better credit score qualifies you for lower interest rates, saving thousands over your loan term.",
  },
  {
    number: "4",
    title: "Compare Multiple Lenders",
    description:
      "Don't settle for the first offer. Shopping around can save you 1-2% on your interest rate.",
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = React.useState("1500000");
  const [interestRate, setInterestRate] = React.useState("14");
  const [loanTerm, setLoanTerm] = React.useState("60");
  const [monthlyPayment, setMonthlyPayment] = React.useState<number | null>(
    null
  );
  const [totalPayment, setTotalPayment] = React.useState<number | null>(null);
  const [totalInterest, setTotalInterest] = React.useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const principal = parseFloat(loanAmount.replace(/,/g, ""));
    const annualRate = parseFloat(interestRate);
    const months = parseInt(loanTerm);

    if (
      isNaN(principal) ||
      isNaN(annualRate) ||
      isNaN(months) ||
      principal <= 0 ||
      months <= 0
    ) {
      return;
    }

    if (annualRate === 0) {
      const payment = principal / months;
      setMonthlyPayment(payment);
      setTotalPayment(principal);
      setTotalInterest(0);
      return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const total = payment * months;
    const interest = total - principal;

    setMonthlyPayment(payment);
    setTotalPayment(total);
    setTotalInterest(interest);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <PageHero
          label="AUTO LOAN CALCULATOR"
          heading="Calculate your monthly car loan payments"
        >
          {/* Calculator Form Card */}
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">
              Loan Calculator
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your loan details to estimate monthly payments
            </p>

            <form onSubmit={handleCalculate} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan-amount">Loan Amount (Ksh)</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  placeholder="e.g. 1500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan-term">Loan Term (months)</Label>
                  <Input
                    id="loan-term"
                    type="number"
                    placeholder="e.g. 60"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold"
              >
                Calculate Monthly Payment
              </Button>
            </form>

            {/* Result Display */}
            {monthlyPayment !== null && (
              <div className="mt-5 rounded-xl bg-primary/5 border border-primary/20 p-5">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estimated Monthly Payment
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    Ksh {formatCurrency(monthlyPayment)}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-primary/10 pt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Total Payment
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      Ksh {formatCurrency(totalPayment!)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Total Interest
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      Ksh {formatCurrency(totalInterest!)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageHero>

        {/* Benefits Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            Simple &amp; Free
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Everything you need to plan your car financing — no strings attached.
          </p>

          <div className="mt-10 grid gap-6 sm:gap-8 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              Tips to Save Money
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Smart financing decisions can save you thousands over the life of
              your loan.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {tips.map((tip) => (
                <div
                  key={tip.number}
                  className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                    {tip.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {tip.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-blue-700 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to find your car?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Browse thousands of vehicles on Autolist and find the perfect car
              that fits your budget.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 bg-white text-primary font-semibold hover:bg-blue-50 gap-2"
            >
              <Link href="/search">
                Browse Cars
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
