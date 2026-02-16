"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LISTING_STATUS_META,
  type ListingStatus,
} from "@/lib/constants/marketplace";

type DashboardListing = {
  id: string;
  title: string;
  price: number;
  views: number;
  leads: number;
  status: ListingStatus;
  updatedAt: string;
};

const METRICS = [
  { label: "Total Views", value: "12,480", trend: "+12.4% from last week" },
  { label: "Inbound Leads", value: "218", trend: "+6.9% from last week" },
  { label: "Active Listings", value: "19", trend: "2 awaiting review" },
  { label: "Sold This Month", value: "7", trend: "2 reserved right now" },
];

const SAMPLE_LISTINGS: DashboardListing[] = [
  {
    id: "LST-001",
    title: "2022 Toyota Prado TX",
    price: 7800000,
    views: 2320,
    leads: 25,
    status: "active",
    updatedAt: "Today",
  },
  {
    id: "LST-002",
    title: "2020 Mazda CX-5",
    price: 3650000,
    views: 1810,
    leads: 18,
    status: "reserved",
    updatedAt: "Yesterday",
  },
  {
    id: "LST-003",
    title: "2019 Nissan X-Trail",
    price: 2890000,
    views: 640,
    leads: 5,
    status: "pending",
    updatedAt: "2 days ago",
  },
  {
    id: "LST-004",
    title: "2018 Subaru Forester",
    price: 2520000,
    views: 422,
    leads: 3,
    status: "draft",
    updatedAt: "3 days ago",
  },
  {
    id: "LST-005",
    title: "2016 Mercedes-Benz C200",
    price: 3180000,
    views: 930,
    leads: 9,
    status: "sold",
    updatedAt: "5 days ago",
  },
];

const QUICK_ACTIONS = ["Edit", "Promote", "Mark as Sold"] as const;

function formatKES(price: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);
}

interface DashboardShellProps {
  addListingHref?: string;
}

export function DashboardShell({ addListingHref = "/dashboard/listings/new" }: DashboardShellProps) {
  const [statusFilter, setStatusFilter] = React.useState<"all" | ListingStatus>("all");

  const filteredListings = React.useMemo(() => {
    if (statusFilter === "all") return SAMPLE_LISTINGS;
    return SAMPLE_LISTINGS.filter((listing) => listing.status === statusFilter);
  }, [statusFilter]);

  return (
    <section className="space-y-6" data-testid="seller-dashboard">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Seller / Dealer Console
          </p>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor listings, lifecycle states, and performance metrics.
          </p>
        </div>
        <Button asChild data-testid="dashboard-add-listing">
          <Link href={addListingHref}>Add Listing</Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{metric.trend}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Listings</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="dashboard-status-filter">
              Filter
            </label>
            <select
              id="dashboard-status-filter"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | ListingStatus)
              }
              data-testid="dashboard-status-filter"
            >
              <option value="all">All states</option>
              {Object.entries(LISTING_STATUS_META).map(([status, meta]) => (
                <option key={status} value={status}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-3 py-2">Listing</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Views</th>
                    <th className="px-3 py-2">Leads</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => {
                    const meta = LISTING_STATUS_META[listing.status];
                    return (
                      <tr
                        key={listing.id}
                        className="rounded-lg bg-gray-5/50 text-sm"
                        data-testid={`dashboard-row-${listing.id}`}
                      >
                        <td className="px-3 py-3">
                          <p className="font-semibold text-foreground">{listing.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatKES(listing.price)} • Updated {listing.updatedAt}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={meta.tone}>{meta.label}</Badge>
                        </td>
                        <td className="px-3 py-3 text-foreground">{listing.views}</td>
                        <td className="px-3 py-3 text-foreground">{listing.leads}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            {QUICK_ACTIONS.map((action) => (
                              <Button
                                key={`${listing.id}-${action}`}
                                type="button"
                                size="sm"
                                variant={action === "Promote" ? "secondary" : "outline"}
                              >
                                {action}
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="cards">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => {
                const meta = LISTING_STATUS_META[listing.status];
                return (
                  <article
                    key={listing.id}
                    className="rounded-xl border border-border bg-white p-4"
                    data-testid={`dashboard-card-${listing.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-foreground">{listing.title}</h3>
                      <Badge variant={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{formatKES(listing.price)}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-5/50 p-3 text-sm">
                      <p>
                        <span className="text-muted-foreground">Views:</span>{" "}
                        <span className="font-semibold text-foreground">{listing.views}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Leads:</span>{" "}
                        <span className="font-semibold text-foreground">{listing.leads}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <Button
                          key={`${listing.id}-${action}-card`}
                          type="button"
                          size="sm"
                          variant={action === "Promote" ? "secondary" : "outline"}
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </section>
  );
}
