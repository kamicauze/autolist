"use client";

import * as React from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SAMPLE_DATA = [120, 180, 150, 220, 280, 250, 310, 350, 300, 380, 420, 400];

export function PageInsightsChart() {
  const max = Math.max(...SAMPLE_DATA);

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Page Insights</h3>
        <select className="h-8 rounded-md border border-input bg-background px-2 text-xs">
          <option>Last 12 months</option>
          <option>Last 6 months</option>
          <option>Last 30 days</option>
        </select>
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end gap-2 h-40">
        {SAMPLE_DATA.map((value, i) => (
          <div key={MONTHS[i]} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
              style={{ height: `${(value / max) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
