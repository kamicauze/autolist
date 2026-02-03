"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Listing } from "@/lib/types/listing";

interface VehicleLoanCalculatorProps {
  price: number;
  currency: string;
}

export function VehicleLoanCalculator({
  price,
  currency,
}: VehicleLoanCalculatorProps) {
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("14");
  const [loanTerm, setLoanTerm] = useState("48");

  const calculations = useMemo(() => {
    const principal = price - (Number(downPayment) || 0);
    const rate = Number(interestRate) / 100 / 12;
    const months = Number(loanTerm);

    if (principal <= 0 || rate <= 0 || months <= 0) {
      return {
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0,
      };
    }

    const monthlyPayment =
      (principal * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment,
      totalInterest,
      totalPayment,
    };
  }, [price, downPayment, interestRate, loanTerm]);

  const formattedPrice = new Intl.NumberFormat("en-KE").format(price);
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Auto Loan Calculator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use our calculator to estimate your monthly car payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Left Col - Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
              Vehicle Price
            </label>
            <div className="relative">
              <input
                type="text"
                value={`${currency} ${formattedPrice}`}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
              Down Payment
            </label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
              Interest Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
              Period Month
            </label>
            <div className="relative">
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Results */}
        <div className="flex flex-col justify-center space-y-6 pt-4 md:pt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Amount financed</span>
              <span className="font-bold text-gray-900">
                 {currency} {formatCurrency(Math.max(0, price - (Number(downPayment) || 0)))}
              </span>
            </div>
            
             <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Interest Payment</span>
              <span className="font-bold text-gray-900">
                 {currency} {formatCurrency(calculations.totalInterest)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100">
              <span className="text-gray-600">Monthly Payment</span>
              <span className="font-bold text-xl text-primary">
                 {currency} {formatCurrency(calculations.monthlyPayment)}
              </span>
            </div>
          </div>

          <Button className="w-full h-12 text-base font-semibold bg-[#2C52D8] hover:bg-[#2546b8] text-white">
            Get a Car Loan today
          </Button>
        </div>
      </div>
    </div>
  );
}
