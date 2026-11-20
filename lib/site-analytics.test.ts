import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  cleanTrackTarget,
  getDeviceType,
  getExternalReferrerOrigin,
  getTrackedPath,
  isLikelyBot,
  isSiteClickEvent,
  SITE_CLICK_EVENTS,
  SITE_EVENT_LABELS,
} from "./site-analytics";

test("only public paths are tracked, without query strings or fragments", () => {
  assert.equal(getTrackedPath("/vehicle/sample?ref=private#contact"), "/vehicle/sample");
  assert.equal(getTrackedPath("/"), "/");
  for (const path of ["/admin", "/dashboard/listings", "/login", "/sell", "/join/sales-agent/token", "/api/track", "//example.com", "search"]) {
    assert.equal(getTrackedPath(path), null, path);
  }
  assert.equal(getTrackedPath(`/${"a".repeat(220)}`), null);
});

test("click names come from a fixed list with a label each", () => {
  assert.equal(isSiteClickEvent("whatsapp_click"), true);
  for (const value of ["page_view", "drop_table", "", undefined, 1]) assert.equal(isSiteClickEvent(value), false);
  for (const name of ["page_view", ...SITE_CLICK_EVENTS] as const) assert.ok(SITE_EVENT_LABELS[name], name);
});

test("targets are trimmed and capped", () => {
  assert.equal(cleanTrackTarget("  Brands \n  page "), "Brands page");
  assert.equal(cleanTrackTarget("   "), undefined);
  assert.equal(cleanTrackTarget(null), undefined);
  assert.equal(cleanTrackTarget("x".repeat(100))?.length, 80);
});

test("referrers keep only an external origin", () => {
  assert.equal(getExternalReferrerOrigin("https://www.google.com/search?q=private", "autolist.co.ke"), "https://www.google.com");
  assert.equal(getExternalReferrerOrigin("https://autolist.co.ke/search?q=private", "autolist.co.ke"), undefined);
  assert.equal(getExternalReferrerOrigin("javascript:alert(1)", "autolist.co.ke"), undefined);
  assert.equal(getExternalReferrerOrigin("", "autolist.co.ke"), undefined);
});

test("bots are skipped and devices are grouped", () => {
  assert.equal(isLikelyBot(""), true);
  assert.equal(isLikelyBot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isLikelyBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148"), false);
  assert.equal(getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148"), "mobile");
  assert.equal(getDeviceType("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36"), "mobile");
  assert.equal(getDeviceType("Mozilla/5.0 (Linux; Android 14; SM-X710) Safari/537.36"), "tablet");
  assert.equal(getDeviceType("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)"), "tablet");
  assert.equal(getDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), "desktop");
});

test("every click name is tagged somewhere in the public UI", () => {
  const sources = ["app", "components"].flatMap((root) =>
    readdirSync(root, { recursive: true, encoding: "utf8" })
      .filter((name) => name.endsWith(".tsx") && !name.includes(".test."))
      .map((name) => readFileSync(join(root, name), "utf8"))
  ).join("\n");
  for (const name of SITE_CLICK_EVENTS) {
    assert.match(sources, new RegExp(`data-track(?:-links)?=(?:"${name}"|\\{[^}]*"${name}")`), name);
  }
});
