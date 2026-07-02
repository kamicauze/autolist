"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types/listing";
import { getRecentlyViewedIds } from "@/lib/utils/recently-viewed";
import { EmptyState, ListingsGrid } from "./listings-grid";

export function RecentlyViewedListings({ limit = 4 }: { limit?: number }) {
  const [listings, setListings] = React.useState<Listing[] | null>(null);

  React.useEffect(() => {
    let active = true;

    const run = async () => {
      const ids = getRecentlyViewedIds().slice(0, limit);

      if (ids.length === 0) {
        if (active) {
          setListings([]);
        }
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

      if (!active) {
        return;
      }

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
  }, [limit]);

  if (listings === null) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="h-[420px] animate-pulse rounded-xl bg-muted" aria-hidden />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState message="Vehicles you view will appear here." />;
  }

  return <ListingsGrid listings={listings} />;
}
