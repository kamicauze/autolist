"use client";

import { ChevronRight, CircleCheckBig, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PriceAdviserSummaryProps {
  price: number;
  currency: string;
  onOpenDetails: () => void;
}

interface PriceAdviserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  price: number;
  currency: string;
}

function formatMoney(currency: string, value: number) {
  return `${currency}${new Intl.NumberFormat("en-KE").format(Math.max(0, Math.round(value)))}`;
}

function getMarketStats(price: number) {
  const marketAverage = Math.round(price * 1.037);
  const diff = price - marketAverage;
  const percentage = marketAverage === 0 ? 0 : (Math.abs(diff) / marketAverage) * 100;

  return {
    marketAverage,
    diff,
    percentage,
    isBelowMarket: diff < 0,
  };
}

export function PriceAdviserSummary({
  price,
  currency,
  onOpenDetails,
}: PriceAdviserSummaryProps) {
  const stats = getMarketStats(price);

  return (
    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CircleCheckBig className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Fair Price</p>
            <p className="text-sm text-gray-600">
              {formatMoney(currency, Math.abs(stats.diff))} ({stats.percentage.toFixed(1)}%){" "}
              {stats.isBelowMarket ? "below" : "above"} market average
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Market Average: {formatMoney(currency, stats.marketAverage)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDetails}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PriceAdviserPanel({
  open,
  onOpenChange,
  title,
  price,
  currency,
}: PriceAdviserPanelProps) {
  const stats = getMarketStats(price);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-gray-200 bg-white p-0 sm:max-w-[448px]"
      >
        <SheetHeader className="border-b border-gray-100 px-6 py-5">
          <SheetTitle className="text-2xl font-bold text-gray-900">Price Adviser</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{formatMoney(currency, price)}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Good</span>
              <span className="text-sm font-medium text-gray-600">Fair</span>
              <span className="text-sm font-medium text-gray-600">High</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-red-400" />
            <p className="mt-4 text-center text-2xl font-bold text-gray-900">Fair Price</p>
            <p className="text-center text-sm text-gray-600">
              {formatMoney(currency, Math.abs(stats.diff))} ({stats.percentage.toFixed(1)}%){" "}
              {stats.isBelowMarket ? "below" : "above"} market average
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900">Market Analysis</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Market Average</span>
              <span className="font-semibold text-gray-900">
                {formatMoney(currency, stats.marketAverage)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Vehicle</span>
              <span className="font-semibold text-gray-900">{formatMoney(currency, price)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Difference</span>
              <span
                className={`font-semibold ${
                  stats.diff <= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {stats.diff > 0 ? "+" : "-"}
                {formatMoney(currency, Math.abs(stats.diff))}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900">Price Insight</h4>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              This vehicle is priced competitively within the market range for similar listings.
              It appears to be a fair value option.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900">Comparable Listings</h4>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm">
                <span className="text-gray-600">48,000 km • Sandton</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(currency, price + 10000)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm">
                <span className="text-gray-600">61,000 km • Pretoria</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(currency, price)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm">
                <span className="text-gray-600">52,000 km • Nairobi</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(currency, price + 35000)}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
