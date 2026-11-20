import assert from "node:assert/strict";
import { mock, test } from "node:test";

mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => null } });
const { parseSiteTrafficSummary } = await import("./site-traffic");

test("traffic summary rows become labelled, non-negative counts", () => {
  const parsed = parseSiteTrafficSummary({
    totals: [{ days: 1, page_views: 4, visitors: 2, visits: 3, clicks: 5 }, { days: 30, page_views: "40", visitors: null, visits: -1, clicks: 9 }],
    daily: [{ day: "2026-11-13", page_views: 4, visitors: 2, visits: 3, clicks: 5 }, { day: "bad" }],
    top_pages: [{ label: "/vehicle/abc", total: 7, visitors: 3 }],
    top_clicks: [{ label: "whatsapp_click", total: 3, visitors: 2 }, { label: "retired_event", total: 1, visitors: 1 }],
  });
  assert.deepEqual(parsed.totals, [
    { days: 1, pageViews: 4, visitors: 2, visits: 3, clicks: 5 },
    { days: 30, pageViews: 40, visitors: 0, visits: 0, clicks: 9 },
  ]);
  assert.equal(parsed.daily.length, 1);
  assert.equal(parsed.daily[0].day, "2026-11-13");
  assert.match(parsed.daily[0].label, /13 Nov/);
  assert.deepEqual(parsed.topPages, [{ label: "/vehicle/abc", total: 7, visitors: 3 }]);
  assert.deepEqual(parsed.topClicks.map((item) => item.label), ["WhatsApp clicks", "retired_event"]);
});

test("missing or malformed summaries are empty rather than invented", () => {
  for (const value of [null, "x", { totals: "x", daily: [null] }]) {
    assert.deepEqual(parseSiteTrafficSummary(value), { totals: [], daily: [], topPages: [], topClicks: [] });
  }
});
