"use client";

import { ChevronRight, CircleCheckBig, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
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

/**
 * Semi-circular gauge SVG matching the Figma design.
 * Green (left) → Blue (center) → Red (right) gradient arc
 * with a needle pointing to the price position.
 */
function PriceGauge({ percentage, isBelowMarket }: { percentage: number; isBelowMarket: boolean }) {
  // Map the percentage to a position on the gauge (0-180 degrees)
  // Below market = left side (good), above market = right side (high)
  // Center = fair
  const clampedPct = Math.min(percentage, 20); // Cap at 20% for visual range
  let angle: number;
  if (isBelowMarket) {
    // Below market → left of center (good side)
    angle = 90 - (clampedPct / 20) * 60; // 90° (center) to 30° (far left)
  } else {
    // Above market → right of center (high side)
    angle = 90 + (clampedPct / 20) * 60; // 90° (center) to 150° (far right)
  }

  const cx = 140;
  const cy = 130;
  const r = 110;
  const needleR = r - 15;

  // Convert angle to radians for needle position
  const rad = (angle * Math.PI) / 180;
  const needleX = cx - needleR * Math.cos(rad);
  const needleY = cy - needleR * Math.sin(rad);

  return (
    <svg viewBox="0 0 280 155" className="mx-auto w-64 h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="65%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* Arc background */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="18"
        strokeLinecap="round"
      />
      {/* Arc gradient */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      {/* Needle */}
      <circle cx={needleX} cy={needleY} r="8" fill="#1e293b" />
      <circle cx={needleX} cy={needleY} r="4" fill="white" />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="4" fill="#94a3b8" />
    </svg>
  );
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
        className="w-full border-l border-gray-200 bg-white p-0 sm:max-w-[448px] flex flex-col overflow-hidden"
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Gauge Section */}
          <div className="text-center">
            <PriceGauge
              percentage={stats.percentage}
              isBelowMarket={stats.isBelowMarket}
            />
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Fair Price</h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatMoney(currency, Math.abs(stats.diff))} ({stats.percentage.toFixed(1)}%){" "}
              {stats.isBelowMarket ? "below" : "above"} market
            </p>
          </div>

          {/* Market Analysis */}
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

          {/* Price Insight */}
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

          {/* Comparable Listings */}
          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900">Comparable Listings</h4>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                <span className="text-gray-600">48,000 km • Sandton</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(currency, price + 10000)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                <span className="text-gray-600">61,000 km • Pretoria</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(currency, price)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                <span className="text-gray-600">52,000 km • Nairobi</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(currency, price + 35000)}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
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
