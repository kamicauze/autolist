"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types/listing";
import {
  buildDashboardPaginationItems,
  paginateDashboardItems,
} from "@/lib/utils/dashboard-listing-pagination";
import { getRecentlyViewedIds } from "@/lib/utils/recently-viewed";
import { EmptyState, ListingsGrid } from "./listings-grid";

const RECENTLY_VIEWED_PAGE_SIZE = 20;

export function RecentlyViewedPageClient() {
  const [listings, setListings] = React.useState<Listing[] | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    let active = true;

    const run = async () => {
      const ids = getRecentlyViewedIds();

      if (ids.length === 0) {
        if (active) setListings([]);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          *,
          images:listing_images(id, r2_key, alt_text, image_order),
          seller:profiles!seller_id(id, full_name, avatar_url),
          dealer:dealers(id, name, logo_url, city)
        `
        )
        .in("id", ids)
        .eq("status", "active");

      if (!active) return;

      if (error) {
        console.error("Error fetching recently viewed listings:", error);
        setListings([]);
        return;
      }

      const byId = new Map((data as Listing[]).map((listing) => [listing.id, listing]));
      setListings(ids.map((id) => byId.get(id)).filter((listing): listing is Listing => Boolean(listing)));
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const pagination = React.useMemo(
    () => paginateDashboardItems(listings ?? [], currentPage, RECENTLY_VIEWED_PAGE_SIZE),
    [currentPage, listings]
  );
  const paginationItems = React.useMemo(
    () => buildDashboardPaginationItems(pagination.currentPage, pagination.totalPages),
    [pagination.currentPage, pagination.totalPages]
  );

  React.useEffect(() => {
    if (currentPage !== pagination.currentPage) {
      setCurrentPage(pagination.currentPage);
    }
  }, [currentPage, pagination.currentPage]);

  if (listings === null) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[420px] animate-pulse rounded-xl bg-muted" aria-hidden />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState message="Vehicles you view will appear here." />;
  }

  return (
    <div>
      <div className="mb-5 text-[13px] text-[#6f7784]">
        Showing {pagination.items.length.toLocaleString("en-KE")} of{" "}
        {listings.length.toLocaleString("en-KE")} recently viewed vehicles
      </div>

      <ListingsGrid listings={pagination.items} />

      {pagination.totalPages > 1 ? (
        <div className="mt-8 flex flex-col gap-3 border-t border-[#eef2f7] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#6f7784]">
            Page {pagination.currentPage.toLocaleString("en-KE")} of{" "}
            {pagination.totalPages.toLocaleString("en-KE")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={pagination.currentPage === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white text-[#374151] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Previous recently viewed page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-10 w-10 items-center justify-center text-[13px] font-semibold text-[#9ca3af]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] border text-[13px] font-semibold transition ${
                    item === pagination.currentPage
                      ? "border-primary bg-primary text-white"
                      : "border-[#d1d5db] bg-white text-[#374151] hover:border-primary hover:text-primary"
                  }`}
                  aria-current={item === pagination.currentPage ? "page" : undefined}
                >
                  {item}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(pagination.totalPages, page + 1))
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white text-[#374151] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Next recently viewed page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
