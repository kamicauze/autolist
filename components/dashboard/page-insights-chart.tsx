"use client";

import * as React from "react";
import { SellerSurface, SellerTabs } from "./seller-dashboard-ui";

const chartPoints = [70, 92, 104, 86, 132, 150, 138, 168];
const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function buildPath(values: number[]) {
  const width = 640;
  const height = 260;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / Math.max(max - min, 1)) * 180 - 24;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function PageInsightsChart() {
  const [range, setRange] = React.useState("month");

  const linePath = buildPath(chartPoints);
  const fillPath = `${linePath} L 640 260 L 0 260 Z`;

  return (
    <SellerSurface className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#ededed] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Page Insights</h2>
          <p className="mt-1 text-[13px] text-[#7a7a7a]">
            Views and lead activity across your active packages.
          </p>
        </div>

        <SellerTabs
          value={range}
          onChange={setRange}
          tabs={[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
          ]}
        />
      </div>

      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-5 text-[13px] text-[#777]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Page view
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#dbe7ff]" />
            Leads
          </span>
        </div>

        <div className="rounded-[22px] bg-[#faf9f7] p-4">
          <svg viewBox="0 0 640 260" className="h-[280px] w-full">
            <defs>
              <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((row) => (
              <line
                key={row}
                x1="0"
                y1={35 + row * 52}
                x2="640"
                y2={35 + row * 52}
                stroke="#ececec"
                strokeDasharray="4 6"
              />
            ))}

            <path d={fillPath} fill="url(#chart-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {chartPoints.map((value, index) => {
              const x = (index / (chartPoints.length - 1)) * 640;
              const max = Math.max(...chartPoints);
              const min = Math.min(...chartPoints);
              const y = 260 - ((value - min) / Math.max(max - min, 1)) * 180 - 24;

              return (
                <g key={labels[index]}>
                  <circle cx={x} cy={y} r="6" fill="#fff" stroke="var(--primary)" strokeWidth="3" />
                  <text x={x} y="252" textAnchor="middle" fontSize="12" fill="#8c8c8c">
                    {labels[index]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </SellerSurface>
  );
}
