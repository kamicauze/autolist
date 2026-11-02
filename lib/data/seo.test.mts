import assert from "node:assert/strict";
import { mock, test } from "node:test";

const now = new Date().toISOString();
const records: Record<string, Array<Record<string, unknown>>> = {
  listings: [
    ...Array.from({ length: 1001 }, (_, index) => ({ id: `public-${String(index).padStart(4, "0")}`, status: "active", sale_channel: "standard", updated_at: now })),
    { id: "dealer-stock", status: "active", sale_channel: "dealer_public", updated_at: now },
    { id: "private-request", status: "active", sale_channel: "dealer_only" },
    { id: "draft-stock", status: "draft", sale_channel: "standard" },
    { id: "sold-stock", status: "sold", sale_channel: "standard" },
  ],
  dealers: [{ id: "approved-dealer", status: "APPROVED" }, { id: "pending-dealer", status: "PENDING" }, { id: "rejected-dealer", status: "REJECTED" }],
  content_posts: [
    { id: "published-article", slug: "buying-advice", status: "published", published_at: "2020-01-01", updated_at: now },
    { id: "draft-article", slug: "private-draft", status: "draft", published_at: null },
    { id: "future-article", slug: "scheduled-article", status: "published", published_at: "2999-01-01" },
    { id: "undated-article", slug: "undated-article", status: "published", published_at: null },
  ],
};
let failTable = "";
const selections: Array<[string, string]> = [];
const ranges: Array<[string, number, number]> = [];
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-test-key";
mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const table = url.pathname.split("/").at(-1)!;
  assert.equal(url.origin, "https://example.supabase.co");
  assert.equal(new Headers(init?.headers).get("authorization"), "Bearer public-test-key");
  selections.push([table, url.searchParams.get("select")!]);
  if (table === failTable) {
    return new Response(JSON.stringify({ message: "unavailable" }), { status: 500 });
  }
  let rows = [...records[table]];
  for (const [field, filter] of url.searchParams) {
    if (filter.startsWith("eq.")) rows = rows.filter(row => row[field] === filter.slice(3));
    if (filter.startsWith("in.(")) rows = rows.filter(row => filter.slice(4, -1).split(",").includes(String(row[field])));
    if (filter === "not.is.null") rows = rows.filter(row => row[field] !== null);
    if (filter.startsWith("lte.")) rows = rows.filter(row => typeof row[field] === "string" && row[field] <= filter.slice(4));
  }
  assert.equal(url.searchParams.get("order"), "id.asc");
  rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const start = Number(url.searchParams.get("offset") || 0);
  const limit = Number(url.searchParams.get("limit"));
  ranges.push([table, start, start + limit - 1]);
  return new Response(JSON.stringify(rows.slice(start, start + limit)), { headers: { "Content-Type": "application/json" } });
});
const { getPublicSitemapEntries } = await import("./seo");

test("anonymous sitemap excludes private stock, unapproved dealers and unpublished articles across API pages", async () => {
  const entries = await getPublicSitemapEntries();
  assert.equal(entries.length, 1004);
  const urls = entries.map(entry => entry.url);
  assert.ok(urls.includes("https://autolist.co.ke/vehicle/public-1000"));
  assert.ok(urls.includes("https://autolist.co.ke/vehicle/dealer-stock"));
  assert.ok(urls.includes("https://autolist.co.ke/blog/buying-advice"));
  assert.ok(urls.includes("https://autolist.co.ke/dealers/approved-dealer"));
  assert.ok(urls.every(url => !/private-request|draft-stock|sold-stock|pending-dealer|rejected-dealer|private-draft|scheduled-article|undated-article/.test(url)));
  assert.ok(selections.every(([table, columns]) => columns === (table === "content_posts" ? "slug,updated_at" : "id,updated_at")));
  assert.ok(ranges.some(([table, start]) => table === "listings" && start === 1000));
});

test("a failed public query does not publish a misleading partial sitemap", async () => {
  failTable = "content_posts";
  await assert.rejects(getPublicSitemapEntries(), /Unable to load public sitemap entries/);
});
