"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  cleanTrackTarget,
  getExternalReferrerOrigin,
  getTrackedPath,
  isSiteClickEvent,
  MAX_SITE_EVENTS_PER_REQUEST,
  SITE_TRACK_ENDPOINT,
  SITE_TRACK_EVENT,
  type SiteTrackDetail,
} from "@/lib/site-analytics";

const VISIT_KEY = "autolist-visit";
const VISIT_TIMEOUT_MS = 30 * 60 * 1000;
const FLUSH_DELAY_MS = 2000;

type QueuedEvent = { name: string; path: string; target?: string; referrer?: string };
type Visit = { id: string; last: number };

let memoryVisit: Visit | null = null;
const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function touchVisit(now = Date.now()) {
  let visit = memoryVisit;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(VISIT_KEY) || "null") as Visit | null;
    if (stored && typeof stored.id === "string" && typeof stored.last === "number") visit = stored;
  } catch {
    // Fall back to the in-memory visit when session storage is unavailable.
  }
  visit = !visit || now - visit.last > VISIT_TIMEOUT_MS ? { id: crypto.randomUUID(), last: now } : { id: visit.id, last: now };
  memoryVisit = visit;
  try {
    window.sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit));
  } catch {
    // The in-memory visit still applies to this page.
  }
  return visit.id;
}

function flush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  while (queue.length > 0 && memoryVisit) {
    const body = JSON.stringify({ visitId: memoryVisit.id, events: queue.splice(0, MAX_SITE_EVENTS_PER_REQUEST) });
    const sent = typeof navigator.sendBeacon === "function"
      && navigator.sendBeacon(SITE_TRACK_ENDPOINT, new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch(SITE_TRACK_ENDPOINT, {
        method: "POST", body, keepalive: true, credentials: "same-origin",
        headers: { "content-type": "application/json" },
      }).catch(() => {});
    }
  }
}

function enqueue(event: QueuedEvent) {
  touchVisit();
  queue.push(event);
  if (queue.length >= MAX_SITE_EVENTS_PER_REQUEST) flush();
  else flushTimer ??= setTimeout(flush, FLUSH_DELAY_MS);
}

function recordClick(name: string | undefined, rawTarget: string | null | undefined) {
  if (!isSiteClickEvent(name)) return;
  const path = getTrackedPath(window.location.pathname);
  if (!path) return;
  const target = cleanTrackTarget(rawTarget);
  enqueue({ name, path, target });
  window.dispatchEvent(new CustomEvent<SiteTrackDetail>(SITE_TRACK_EVENT, { detail: { name, target } }));
}

/** The nearest data-track element wins; forms are counted on submit, not on clicks inside them. */
export function findTrackedClick(element: Pick<Element, "closest">) {
  const tagged = element.closest<HTMLElement>("[data-track]");
  if (tagged) return tagged.tagName === "FORM" ? null : { name: tagged.dataset.track, target: tagged.dataset.trackTarget };
  const link = element.closest<HTMLAnchorElement>("a[href]");
  const group = link?.closest<HTMLElement>("[data-track-links]");
  return link && group ? { name: group.dataset.trackLinks, target: link.dataset.trackTarget ?? link.textContent } : null;
}

function handleClick(event: MouseEvent) {
  const click = event.target instanceof Element ? findTrackedClick(event.target) : null;
  if (click) recordClick(click.name, click.target);
}

function handleSubmit(event: SubmitEvent) {
  const form = event.target instanceof HTMLFormElement ? event.target.closest<HTMLFormElement>("form[data-track]") : null;
  if (form) recordClick(form.dataset.track, form.dataset.trackTarget);
}

function flushWhenHidden() {
  if (document.visibilityState === "hidden") flush();
}

/**
 * Records public page views and clicks on elements tagged with data-track="event_name"
 * (optional data-track-target), or links inside a data-track-links="event_name" container.
 */
export function SiteTracker() {
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);
  const firstView = useRef(true);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    const path = getTrackedPath(pathname);
    if (!path) return;
    const referrer = firstView.current ? getExternalReferrerOrigin(document.referrer, window.location.host) : undefined;
    firstView.current = false;
    enqueue({ name: "page_view", path, referrer });
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
