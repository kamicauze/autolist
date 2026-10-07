"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/finance/money-input";
import { ResultRow } from "@/components/finance/result-row";
import {
  DEFAULT_INTEREST_RATE,
  DEFAULT_LOAN_TERM_MONTHS,
  INTEREST_RATE_OPTIONS,
  LOAN_TERM_MONTH_OPTIONS,
  budgetSearchHref,
  computeAffordability,
} from "@/lib/finance/affordability";
import { formatKes, parseAmount } from "@/lib/finance/format";

export function AffordabilityCalculator() {
  const id = React.useId();
  const [income, setIncome] = React.useState("");
  const [debts, setDebts] = React.useState("");
  const [deposit, setDeposit] = React.useState("");
  const [termMonths, setTermMonths] = React.useState(String(DEFAULT_LOAN_TERM_MONTHS));
  const [rate, setRate] = React.useState(String(DEFAULT_INTEREST_RATE));

  const incomeValue = parseAmount(income);
  const debtsValue = parseAmount(debts);
  const depositValue = parseAmount(deposit);

  const result = computeAffordability({
    grossMonthlyIncome: incomeValue,
    existingMonthlyDebts: debtsValue,
    deposit: depositValue,
    termMonths: Number(termMonths),
    annualRatePercent: Number(rate),
  });

  const hasIncome = incomeValue > 0;
  const debtsUseWholeBudget = hasIncome && result.availableBudget === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-lg font-semibold text-foreground">Buy within your budget</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your income and commitments to see the most you should spend on a car.
        </p>
      </div>

      <div className="grid md:grid-cols-2">
        <form
          className="space-y-4 px-5 py-5 sm:px-6"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Affordability inputs"
        >
          <div className="space-y-2">
            <Label htmlFor={`${id}-income`}>Gross monthly income</Label>
            <MoneyInput
              id={`${id}-income`}
              placeholder="e.g. 150,000"
              value={income}
              onValueChange={setIncome}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-debts`}>Existing monthly debts</Label>
            <MoneyInput
              id={`${id}-debts`}
              placeholder="e.g. 20,000"
              value={debts}
              onValueChange={setDebts}
              aria-describedby={`${id}-debts-hint`}
            />
            <p id={`${id}-debts-hint`} className="text-xs text-muted-foreground">
              Loan, Sacco and credit repayments you already make each month.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-deposit`}>Deposit / trade-in</Label>
            <MoneyInput
              id={`${id}-deposit`}
              placeholder="e.g. 300,000"
              value={deposit}
              onValueChange={setDeposit}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-term`}>Loan term</Label>
              <Select value={termMonths} onValueChange={setTermMonths}>
                <SelectTrigger id={`${id}-term`} className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TERM_MONTH_OPTIONS.map((months) => (
                    <SelectItem key={months} value={String(months)}>
                      {months} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${id}-rate`}>Interest rate</Label>
              <Select value={rate} onValueChange={setRate}>
                <SelectTrigger id={`${id}-rate`} className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTEREST_RATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <div className="flex flex-col border-t border-border bg-brand-tint px-5 py-5 sm:px-6 md:border-l md:border-t-0">
          {hasIncome ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">Estimated buying power</p>
              <p
                className="mt-1 text-3xl font-bold tracking-tight text-primary tabular-nums"
                aria-live="polite"
                aria-atomic="true"
              >
                Up to {formatKes(result.maxCarPrice)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on the 15% of gross income rule
              </p>

              {debtsUseWholeBudget ? (
                <p className="mt-4 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground/80">
                  Your existing debts already take up the 15% car budget, so this rule leaves no room
                  for a loan instalment.
                  {depositValue > 0 ? " The figure above is your deposit alone." : null}
                </p>
              ) : null}

              <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
                <ResultRow label="Monthly car budget (15% of income)" value={formatKes(result.maxMonthlyBudget)} />
                {debtsValue > 0 ? (
                  <ResultRow label="Less existing debts" value={`\u2212 ${formatKes(debtsValue)}`} />
                ) : null}
                <ResultRow label="Monthly loan repayment capacity" value={formatKes(result.monthlyLoanCapacity)} />
                <ResultRow label="Running-costs reserve (30%)" value={formatKes(result.runningCostsReserve)} />
                <ResultRow label="Maximum loan amount" value={formatKes(result.maxLoanAmount)} />
                {depositValue > 0 ? (
                  <ResultRow label="Plus deposit / trade-in" value={formatKes(depositValue)} />
                ) : null}
              </dl>

              {result.maxCarPrice > 0 ? (
                <Button asChild className="mt-5 w-full">
                  <Link href={budgetSearchHref(result.maxCarPrice)}>
                    Show cars in my budget
                    <ArrowRight />
                  </Link>
                </Button>
              ) : null}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-primary">
                <Wallet className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-3 font-semibold text-foreground">Your buying power will show here</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Enter your gross monthly income to see the highest car price your budget supports.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
