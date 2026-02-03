"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LoanCalculator() {
  const [totalPrice, setTotalPrice] = useState(600);
  const [downPaymentPercent, setDownPaymentPercent] = useState(0);
  const [interestRate, setInterestRate] = useState(1.3);
  const [loanTerm, setLoanTerm] = useState(12);

  const downPaymentAmount = (totalPrice * downPaymentPercent) / 100;
  const amountFinanced = totalPrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0 && loanTerm > 0
      ? (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1)
      : amountFinanced / loanTerm;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1285px] px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[500px] rounded-[24px] overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/sample-car-4.jpg"
              alt="Luxury car"
              fill
              className="object-cover"
              priority
            />
            {/* Premium Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center p-6 sm:p-12">
            {/* Calculator Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900">
                Auto Loan Calculator
              </h2>
              <p className="text-gray-500 mt-1 mb-6">
                Use our calculator to estimate your monthly car payments.
              </p>

              <div className="space-y-4">
                {/* Total Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Total Price
                  </label>
                  <input
                    type="text"
                    placeholder="Ksh"
                    value={totalPrice || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      setTotalPrice(Number(value) || 0);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>

                {/* Down payment + Terms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Down payment
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Terms
                    </label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value={12}>12 months</option>
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                      <option value={48}>48 months</option>
                      <option value={60}>60 months</option>
                      <option value={72}>72 months</option>
                    </select>
                  </div>
                </div>

                {/* Interest rate + Frequency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Interest rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      &nbsp;
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Results */}
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Down payment amount</span>
                    <span className="font-medium text-gray-900">
                      KSh{formatCurrency(downPaymentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount financed</span>
                    <span className="font-medium text-primary">
                      Ksh{formatCurrency(amountFinanced)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-medium">Monthly payment</span>
                    <span className="font-medium text-primary">
                      Ksh{formatCurrency(isNaN(monthlyPayment) ? 0 : monthlyPayment)}
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full mt-2">
                  <Link href="/search">See 1,500 matches</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
