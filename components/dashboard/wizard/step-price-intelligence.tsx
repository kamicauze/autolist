"use client";

import { Badge } from "@/components/ui/badge";
import { useWizard, formatKES } from "./wizard-context";

export function StepPriceIntelligence() {
  const { draft, marketIndicator } = useWizard();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Price Intelligence</h2>
      <p className="text-sm text-muted-foreground">
        Display-only market guidance based on current benchmarks.
      </p>
      <div className="rounded-xl border border-border bg-white p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Market Price Indicator
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Badge variant={marketIndicator.tone as "success" | "warning" | "info" | "outline"}>
            {marketIndicator.label}
          </Badge>
          <p className="text-sm text-muted-foreground">{marketIndicator.note}</p>
        </div>
        <p className="mt-3 text-sm text-foreground">
          Current listing price: {formatKES(draft.priceKes)}
        </p>
      </div>
    </div>
  );
}
