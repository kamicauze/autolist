"use client";

import * as React from "react";
import type { PricePositioningResult } from "@/lib/types/market-insights";
import { useWizard, formatKES } from "./wizard-context";
import { SellerStatusPill } from "../seller-dashboard-ui";

const initialInsight: PricePositioningResult = {
  status: "insufficient_data",
  label: "Incomplete pricing data",
  tone: "neutral",
  note: "Add make, model, year and price to estimate market position.",
  confidence: "low",
  confidenceLabel: "Low confidence",
  basedOn: "missing listing details",
  sampleSize: 0,
  marketAverage: null,
  marketMedian: null,
  marketMin: null,
  marketMax: null,
  differenceFromMedian: null,
  percentageFromMedian: null,
  comparables: [],
};

export function StepPriceIntelligence() {
  const { draft } = useWizard();
  const [insight, setInsight] = React.useState<PricePositioningResult>(initialInsight);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const payload = {
      make: draft.details.make || "",
      model: draft.details.model || "",
      year: draft.details.year ? parseInt(draft.details.year, 10) : null,
      price: draft.priceKes ? parseFloat(draft.priceKes.replace(/,/g, "")) : 0,
      currency: "KES",
      mileage: draft.details.mileage ? parseInt(draft.details.mileage, 10) : null,
      bodyType: draft.details.bodyType || draft.details.bodyStyle || null,
      transmission: draft.details.transmission || null,
      fuelType: draft.details.engineType || draft.details.fuelType || null,
    };

    if (!payload.make || !payload.model || !payload.price) {
      setInsight(initialInsight);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/market-insights/price-positioning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load market insight.");
        }

        const result = (await response.json()) as PricePositioningResult;
        setInsight(result);
      } catch {
        if (!controller.signal.aborted) {
          setInsight({
            ...initialInsight,
            label: "Pricing insight unavailable",
            note: "We could not estimate market position right now. Please try again in a moment.",
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [
    draft.details.bodyStyle,
    draft.details.bodyType,
    draft.details.engineType,
    draft.details.fuelType,
    draft.details.make,
    draft.details.mileage,
    draft.details.model,
    draft.details.transmission,
    draft.details.year,
    draft.priceKes,
  ]);

  const tone =
    insight.tone === "green"
      ? ("green" as const)
      : insight.tone === "amber"
        ? ("amber" as const)
        : insight.tone === "blue"
          ? ("blue" as const)
          : ("neutral" as const);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-[28px] font-semibold text-[#202224]">Price Intelligence</h2>
        <p className="mt-2 text-[14px] leading-6 text-[#767676]">
          Review how the entered seller price compares with the current benchmark range for this category.
        </p>
      </div>

      <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <SellerStatusPill label={isLoading ? "Calculating..." : insight.label} tone={tone} />
          <p className="text-[14px] text-[#6e6e6e]">{insight.note}</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-[#ededed] bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Current listing price</p>
            <p className="mt-3 font-heading text-[30px] font-semibold text-[#202224]">
              {formatKES(draft.priceKes)}
            </p>
          </div>
          <div className="rounded-[20px] border border-[#ededed] bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Market median</p>
            <p className="mt-3 font-heading text-[30px] font-semibold text-[#202224]">
              {formatKES(String(insight.marketMedian || 0))}
            </p>
          </div>
          <div className="rounded-[20px] border border-[#ededed] bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Confidence</p>
            <p className="mt-3 text-[14px] leading-6 text-[#6e6e6e]">
              {insight.confidenceLabel} based on {insight.sampleSize} comparable listings using{" "}
              {insight.basedOn}.
            </p>
          </div>
        </div>

        {insight.comparables.length > 0 ? (
          <div className="mt-5 rounded-[20px] border border-[#ededed] bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Comparable listings</p>
            <div className="mt-3 space-y-3">
              {insight.comparables.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <div className="text-[#6e6e6e]">
                    {item.title} {item.location ? `• ${item.location}` : ""}
                  </div>
                  <div className="font-semibold text-[#202224]">{formatKES(String(item.price))}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
