"use client";

import * as React from "react";

type CmsTrackEvent =
  | {
      type: "banner_impression";
      ids: string[];
    }
  | {
      type: "banner_click";
      id: string;
    }
  | {
      type: "offer_redemption";
      id: string;
    };

function sendCmsTrackEvent(event: CmsTrackEvent) {
  const payload = JSON.stringify(event);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/cms/track", blob);
    return;
  }

  void fetch("/api/cms/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export function useCmsBannerImpressions(ids: string[]) {
  const key = ids.join(",");

  React.useEffect(() => {
    const trackedIds = key.split(",").filter(Boolean);
    if (trackedIds.length === 0) return;
    sendCmsTrackEvent({ type: "banner_impression", ids: trackedIds });
  }, [key]);
}

export function trackCmsBannerClick(id: string) {
  sendCmsTrackEvent({ type: "banner_click", id });
}

export function trackCmsOfferRedemption(id: string) {
  sendCmsTrackEvent({ type: "offer_redemption", id });
}
