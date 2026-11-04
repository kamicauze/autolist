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
    if (navigator.sendBeacon("/api/cms/track", blob)) return;
  }

  void fetch("/api/cms/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function useCmsBannerImpressions(ids: string[]) {
  const ref = React.useRef<HTMLDivElement>(null);
  const key = ids.join(",");

  React.useEffect(() => {
    const element = ref.current;
    const trackedIds = key.split(",").filter(Boolean);
    if (!element || trackedIds.length === 0) return;

    let recorded = false;
    let visible = false;
    const recordImpression = () => {
      if (recorded || !visible || document.visibilityState !== "visible") return;
      recorded = true;
      sendCmsTrackEvent({ type: "banner_impression", ids: trackedIds });
      observer.disconnect();
      document.removeEventListener("visibilitychange", recordImpression);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.01;
      recordImpression();
    }, { threshold: 0.01 });
    observer.observe(element);
    document.addEventListener("visibilitychange", recordImpression);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", recordImpression);
    };
  }, [key]);

  return ref;
}

export function trackCmsBannerClick(id: string) {
  sendCmsTrackEvent({ type: "banner_click", id });
}

export function trackCmsOfferRedemption(id: string) {
  sendCmsTrackEvent({ type: "offer_redemption", id });
}
