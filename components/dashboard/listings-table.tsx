"use client";

import * as React from "react";
import Image from "next/image";
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LISTING_STATUS_META,
  type ListingStatus,
} from "@/lib/constants/marketplace";
import { cn } from "@/lib/utils";

interface TableListing {
  id: string;
  title: string;
  price: number;
  status: ListingStatus;
  date: string;
  image?: string;
}

const SAMPLE_LISTINGS: TableListing[] = [
  {
    id: "1",
    title: "2022 Toyota Prado TX",
    price: 7800000,
    status: "active",
    date: "Dec 12, 2025",
  },
  {
    id: "2",
    title: "2020 Mazda CX-5",
    price: 3650000,
    status: "active",
    date: "Dec 10, 2025",
  },
  {
    id: "3",
    title: "2019 Nissan X-Trail",
    price: 2890000,
    status: "pending",
    date: "Dec 8, 2025",
  },
  {
    id: "4",
    title: "2018 Subaru Forester",
    price: 2520000,
    status: "draft",
    date: "Dec 5, 2025",
  },
  {
    id: "5",
    title: "2016 Mercedes-Benz C200",
    price: 3180000,
    status: "sold",
    date: "Dec 1, 2025",
  },
];

function formatKES(price: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ListingsTable() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | ListingStatus>(
    "all"
  );
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return SAMPLE_LISTINGS.filter((l) => {
      const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <h3 className="text-base font-semibold text-foreground">
          Listing List
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search listing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 pl-9 text-sm"
            />
          </div>
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | ListingStatus)
            }
          >
            <option value="all">All Status</option>
            {Object.entries(LISTING_STATUS_META).map(([status, meta]) => (
              <option key={status} value={status}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((listing) => {
              const meta = LISTING_STATUS_META[listing.status];
              return (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 rounded-md bg-gray-100" />
                      <span className="text-sm font-medium text-foreground">
                        {listing.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={meta.tone}>{meta.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatKES(listing.price)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {listing.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === listing.id ? null : listing.id)
                        }
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === listing.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-white py-1 shadow-lg">
                          <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-gray-50">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-gray-50">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No listings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
