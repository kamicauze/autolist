"use client";

import * as React from "react";
import { recordRecentlyViewed } from "@/lib/utils/recently-viewed";

export function RecordRecentlyViewed({ listingId }: { listingId: string }) {
  React.useEffect(() => {
    recordRecentlyViewed(listingId);
  }, [listingId]);

  return null;
}
