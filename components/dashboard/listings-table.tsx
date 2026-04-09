"use client";

import * as React from "react";
import { CalendarDays, Eye, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import {
  SellerPagination,
  SellerStatusPill,
  SellerSurface,
  formatDashboardCurrency,
} from "./seller-dashboard-ui";

type DashboardListing = {
  id: string;
  title: string;
  date: string;
  status: "active" | "pending" | "draft" | "sold";
  price: number;
};

const tableListings: DashboardListing[] = [
  {
    id: "1",
    title: "Mercedes Benz GLC 2021",
    date: "2025-01-22",
    status: "active",
    price: 7250000,
  },
  {
    id: "2",
    title: "Toyota Land Cruiser Prado TXL",
    date: "2025-01-17",
    status: "pending",
    price: 6850000,
  },
  {
    id: "3",
    title: "Audi Q8 S Line",
    date: "2025-01-10",
    status: "draft",
    price: 12400000,
  },
  {
    id: "4",
    title: "Mazda CX-5 Touring",
    date: "2025-01-08",
    status: "active",
    price: 3250000,
  },
  {
    id: "5",
    title: "Subaru Forester XT",
    date: "2024-12-28",
    status: "sold",
    price: 2980000,
  },
];

const tones = {
  active: "green" as const,
  pending: "amber" as const,
  draft: "blue" as const,
  sold: "neutral" as const,
};

export function ListingsTable() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All status");

  const listings = tableListings.filter((listing) => {
    const matchesQuery = listing.title.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All status" || listing.status === status.toLowerCase();
    return matchesQuery && matchesStatus;
  });

  return (
    <SellerSurface className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#ededed] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-heading text-[24px] font-semibold text-[#202224]">New Listing</h2>
          <p className="mt-1 text-[13px] text-[#7a7a7a]">
            Monitor the latest inventory states, draft packages, and publishing activity.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex h-12 min-w-[240px] items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
            <Search className="h-4 w-4 text-[#939393]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search here..."
              className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
          <button className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#6e6e6e]">
            <CalendarDays className="h-4 w-4" />
            Jan 01 - Jan 30
          </button>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 min-w-[154px] rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#202224] outline-none"
          >
            <option>All status</option>
            <option>active</option>
            <option>pending</option>
            <option>draft</option>
            <option>sold</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#ededed] text-left text-[12px] uppercase tracking-[0.18em] text-[#8a8a8a]">
              <th className="px-5 py-4 font-medium">Listing</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="px-5 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-[#f1f1f1] last:border-b-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-[72px] rounded-[16px] bg-[linear-gradient(135deg,#f0f4ff,#e7e1d8)]" />
                    <p className="text-[14px] font-semibold text-[#202224]">{listing.title}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-[14px] text-[#707070]">
                  {new Date(listing.date).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-5 py-4">
                  <SellerStatusPill
                    label={listing.status[0].toUpperCase() + listing.status.slice(1)}
                    tone={tones[listing.status]}
                  />
                </td>
                <td className="px-5 py-4 text-[14px] font-semibold text-[#202224]">
                  {formatDashboardCurrency(listing.price)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ededed] text-[#727272] transition hover:border-[#2563eb] hover:text-[#2563eb]">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ededed] text-[#727272] transition hover:border-[#2563eb] hover:text-[#2563eb]">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ededed] text-[#727272] transition hover:border-[#f04438] hover:text-[#f04438]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ededed] text-[#727272] transition hover:border-[#2563eb] hover:text-[#2563eb]">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SellerPagination />
    </SellerSurface>
  );
}
