"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LISTING_STATUS_META,
  type ListingStatus,
} from "@/lib/constants/marketplace";
import { getImageUrl } from "@/lib/utils/listings";
import type { Listing } from "@/lib/types/listing";

interface MyListingsProps {
  listings: Listing[];
}

function formatKES(price: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(price);
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export function MyListings({ listings }: MyListingsProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | ListingStatus>("all");
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return listings.filter((l) => {
      const title = `${l.year} ${l.make} ${l.model}`.toLowerCase();
      const matchSearch = title.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, listings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
          <p className="text-sm text-muted-foreground">Manage all your vehicle listings</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Listing
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 pl-9 text-sm"
            />
          </div>
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ListingStatus)}
          >
            <option value="all">All Status</option>
            {Object.entries(LISTING_STATUS_META).map(([status, meta]) => (
              <option key={status} value={status}>{meta.label}</option>
            ))}
          </select>
        </div>

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
                const title = `${listing.year} ${listing.make} ${listing.model}`;
                const coverImage = listing.images
                  ?.sort((a, b) => a.image_order - b.image_order)[0];
                const imageUrl = coverImage ? getImageUrl(coverImage.r2_key) : null;

                return (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 shrink-0 rounded-md bg-gray-100 overflow-hidden relative">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <span className="text-sm font-medium text-foreground">{title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={meta.tone}>{meta.label}</Badge></td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatKES(listing.price)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(listing.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openMenu === listing.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-white py-1 shadow-lg">
                            <Link href={`/vehicle/${listing.id}`} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50">
                              <Eye className="h-3.5 w-3.5" /> View
                            </Link>
                            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"><Edit className="h-3.5 w-3.5" /> Edit</button>
                            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
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
                    {listings.length === 0 ? "No listings yet. Create your first listing!" : "No listings match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
