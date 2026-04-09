"use client";

import { ChevronRight, CircleAlert, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { PricePositioningResult } from "@/lib/types/market-insights";

interface PriceAdviserSummaryProps {
  price: number;
  currency: string;
  pricePositioning: PricePositioningResult;
  onOpenDetails: () => void;
}

interface PriceAdviserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  price: number;
  currency: string;
  pricePositioning: PricePositioningResult;
}

function formatMoney(currency: string, value: number | null) {
  if (value == null) return "N/A";
  return `${currency}${new Intl.NumberFormat("en-KE").format(Math.max(0, Math.round(value)))}`;
}

function PriceGauge({
  percentage,
  status,
}: {
  percentage: number | null;
  status: PricePositioningResult["status"];
}) {
  const normalized = Math.min(Math.abs(percentage || 0), 20);
  let angle = 90;

  if (status === "below_market") {
    angle = 90 - (normalized / 20) * 60;
  } else if (status === "above_market") {
    angle = 90 + (normalized / 20) * 60;
  }

  const cx = 140;
  const cy = 130;
  const r = 110;
  const needleR = r - 15;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx - needleR * Math.cos(rad);
  const needleY = cy - needleR * Math.sin(rad);

  return (
    <svg viewBox="0 0 280 155" className="mx-auto h-auto w-64" aria-hidden="true">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="65%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <circle cx={needleX} cy={needleY} r="8" fill="#1e293b" />
      <circle cx={needleX} cy={needleY} r="4" fill="white" />
      <circle cx={cx} cy={cy} r="4" fill="#94a3b8" />
    </svg>
  );
}

export function PriceAdviserSummary({
  currency,
  pricePositioning,
  onOpenDetails,
}: PriceAdviserSummaryProps) {
  const isInsufficient = pricePositioning.status === "insufficient_data";

  return (
    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CircleCheckBig className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{pricePositioning.label}</p>
            <p className="text-sm text-gray-600">{pricePositioning.note}</p>
            {!isInsufficient ? (
              <p className="mt-1 text-xs text-gray-500">
                Market median: {formatMoney(currency, pricePositioning.marketMedian)} •{" "}
                {pricePositioning.confidenceLabel}
              </p>
            ) : null}
          </div>
        </div>

        {!isInsufficient ? (
          <button
            type="button"
            onClick={onOpenDetails}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Details
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
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
  pricePositioning,
}: PriceAdviserPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden border-l border-gray-200 bg-white p-0 sm:max-w-[448px]"
      >
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="text-center">
            <PriceGauge
              percentage={pricePositioning.percentageFromMedian}
              status={pricePositioning.status}
            />
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{pricePositioning.label}</h2>
            <p className="mt-1 text-sm text-gray-600">{pricePositioning.note}</p>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900">Market Analysis</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Market Median</span>
              <span className="font-semibold text-gray-900">
                {formatMoney(currency, pricePositioning.marketMedian)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Market Average</span>
              <span className="font-semibold text-gray-900">
                {formatMoney(currency, pricePositioning.marketAverage)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{title}</span>
              <span className="font-semibold text-gray-900">{formatMoney(currency, price)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Difference from median</span>
              <span
                className={`font-semibold ${
                  (pricePositioning.differenceFromMedian || 0) <= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {(pricePositioning.differenceFromMedian || 0) > 0 ? "+" : "-"}
                {formatMoney(currency, Math.abs(pricePositioning.differenceFromMedian || 0))}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-blue-600" />
              <h4 className="text-base font-semibold text-gray-900">Price Insight</h4>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Based on {pricePositioning.sampleSize} comparable active listings using{" "}
              {pricePositioning.basedOn}. Confidence: {pricePositioning.confidenceLabel.toLowerCase()}.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-900">Comparable Listings</h4>
            <div className="mt-3 space-y-2">
              {pricePositioning.comparables.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm"
                >
                  <span className="text-gray-600">
                    {item.year} • {item.mileage ? `${item.mileage.toLocaleString()} km` : "Mileage n/a"} •{" "}
                    {item.location || "Kenya"}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(currency, item.price)}
                  </span>
                </div>
              ))}
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
