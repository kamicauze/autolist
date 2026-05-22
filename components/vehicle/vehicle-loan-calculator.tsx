"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface VehicleLoanCalculatorProps {
  price: number;
  currency: string;
  onApplyForFinancing?: () => void;
}

export function VehicleLoanCalculator({
  price,
  currency,
  onApplyForFinancing,
}: VehicleLoanCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState("0");
  const [downPaymentPrice, setDownPaymentPrice] = useState("0");
  const [interestRate, setInterestRate] = useState("14");
  const [loanTerm, setLoanTerm] = useState("12");
  const [repaymentType, setRepaymentType] = useState("Monthly");

  const calculations = useMemo(() => {
    const downPercent = Number(downPaymentPercent) || 0;
    const enteredDownPaymentAmount = Number(downPaymentPrice.replace(/,/g, "")) || 0;
    const downPaymentAmount = Math.min(price, Math.max(0, enteredDownPaymentAmount || (price * downPercent) / 100));
    const principal = Math.max(0, price - downPaymentAmount);
    const months = Number(loanTerm) || 12;
    const monthlyRate = (Number(interestRate) || 0) / 100 / 12;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      return {
        downPaymentAmount,
        financedAmount: principal,
        monthlyPayment: 0,
      };
    }

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return {
      downPaymentAmount,
      financedAmount: principal,
      monthlyPayment,
    };
  }, [price, downPaymentPercent, downPaymentPrice, interestRate, loanTerm]);

  const formatMoney = (value: number) =>
    `${currency}${new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value))}`;

  const formatNumberInput = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));

  const handleDownPaymentPercentChange = (value: string) => {
    const percent = Math.min(100, Math.max(0, Number(value) || 0));
    setDownPaymentPercent(value);
    setDownPaymentPrice(formatNumberInput((price * percent) / 100));
  };

  const handleDownPaymentPriceChange = (value: string) => {
    const numeric = Math.min(price, Math.max(0, Number(value.replace(/[^0-9.]/g, "")) || 0));
    setDownPaymentPrice(value.replace(/[^0-9.,]/g, ""));
    setDownPaymentPercent(price > 0 ? ((numeric / price) * 100).toFixed(1).replace(/\.0$/, "") : "0");
  };

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Total Price</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-900">
            {formatMoney(price)}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Deposit</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={downPaymentPercent}
              onChange={(event) => handleDownPaymentPercentChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 pr-8 text-sm text-gray-900 focus:border-primary focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              %
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Down payment price</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={downPaymentPrice}
              onChange={(event) => handleDownPaymentPriceChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 pl-12 text-sm text-gray-900 focus:border-primary focus:outline-none"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {currency}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Interest rate</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              value={interestRate}
              onChange={(event) => setInterestRate(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 pr-8 text-sm text-gray-900 focus:border-primary focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              %
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Terms</label>
          <select
            value={loanTerm}
            onChange={(event) => setLoanTerm(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none"
          >
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
            <option value="48">48 months</option>
            <option value="60">60 months</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Repayment type</label>
          <select
            value={repaymentType}
            onChange={(event) => setRepaymentType(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none"
          >
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Down payment amount</span>
          <span className="font-semibold text-gray-900">
            {formatMoney(calculations.downPaymentAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Amount financed</span>
          <span className="font-semibold text-gray-900">
            {formatMoney(calculations.financedAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-gray-600">Monthly payment</span>
          <span className="font-bold text-primary">{formatMoney(calculations.monthlyPayment)}</span>
        </div>
      </div>

      <Button
        type="button"
        className="w-full bg-primary text-white hover:bg-primary/90"
        onClick={onApplyForFinancing}
      >
        Apply for Financing
      </Button>
    </div>
  );
}
