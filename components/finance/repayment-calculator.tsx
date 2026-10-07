"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
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
  LOAN_TERM_MONTH_OPTIONS,
  computeLoan,
} from "@/lib/finance/affordability";
import { formatKes, parseAmount } from "@/lib/finance/format";

export function RepaymentCalculator() {
  const id = React.useId();
  const [price, setPrice] = React.useState("2500000");
  const [deposit, setDeposit] = React.useState("500000");
  const [rate, setRate] = React.useState(String(DEFAULT_INTEREST_RATE));
  const [termMonths, setTermMonths] = React.useState(String(DEFAULT_LOAN_TERM_MONTHS));

  const priceValue = parseAmount(price);
  const depositValue = parseAmount(deposit);
  const rateValue = parseAmount(rate);
  const months = Number(termMonths);

  const result = computeLoan({
    amount: priceValue,
    downPayment: depositValue,
    annualRate: rateValue,
    years: months / 12,
  });

  const amountFinanced = Math.max(priceValue - depositValue, 0);
  const depositShare = priceValue > 0 ? Math.round((Math.min(depositValue, priceValue) / priceValue) * 100) : 0;
  const hasPrice = priceValue > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-lg font-semibold text-foreground">Monthly repayment calculator</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimate the instalment on a specific car.
        </p>
      </div>

      <div className="grid md:grid-cols-2">
        <form
          className="space-y-4 px-5 py-5 sm:px-6"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Repayment inputs"
        >
          <div className="space-y-2">
            <Label htmlFor={`${id}-price`}>Vehicle price</Label>
            <MoneyInput
              id={`${id}-price`}
              placeholder="e.g. 2,500,000"
              value={price}
              onValueChange={setPrice}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-deposit`}>Deposit</Label>
            <MoneyInput
              id={`${id}-deposit`}
              placeholder="e.g. 500,000"
              value={deposit}
              onValueChange={setDeposit}
              aria-describedby={`${id}-deposit-hint`}
            />
            <p id={`${id}-deposit-hint`} className="text-xs text-muted-foreground">
              {hasPrice
                ? `${depositShare}% of the price. Most banks ask for 20% to 50%.`
                : "Most banks ask for 20% to 50% of the price."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-rate`}>Interest rate (% a year)</Label>
              <Input
                id={`${id}-rate`}
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step={0.1}
                placeholder="e.g. 12"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                className="h-11 tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${id}-term`}>Loan term</Label>
              <Select value={termMonths} onValueChange={setTermMonths}>
                <SelectTrigger id={`${id}-term`} className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TERM_MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <div className="flex flex-col border-t border-border bg-brand-tint px-5 py-5 sm:px-6 md:border-l md:border-t-0">
          <p className="text-sm font-medium text-muted-foreground">Estimated monthly repayment</p>
          <p
            className="mt-1 text-3xl font-bold tracking-tight text-primary tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatKes(result.monthly)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Over {months} months at {rateValue}% a year
          </p>

          {hasPrice && amountFinanced === 0 ? (
            <p className="mt-4 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground/80">
              Your deposit covers the full price, so there is nothing to finance.
            </p>
          ) : null}

          <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
            <ResultRow label="Amount financed" value={formatKes(amountFinanced)} />
            <ResultRow label="Total interest" value={formatKes(result.interest)} />
            <ResultRow label="Total loan repayments" value={formatKes(result.total)} />
            <ResultRow label="Total cost incl. deposit" value={formatKes(result.total + Math.min(depositValue, priceValue))} />
          </dl>
        </div>
      </div>
    </div>
  );
}
