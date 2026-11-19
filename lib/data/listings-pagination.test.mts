import assert from "node:assert/strict";
import { mock, test } from "node:test";

const inventory = Array.from({ length: 40 }, (_, index) => ({
  id: `vehicle-${index}`, seller_id: "seller", status: "active", sale_channel: "standard",
  make: "Toyota", model: "Sample", category: "car", price: index,
  created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
  is_featured: index % 2 === 0, metadata: {},
  dealer: { city: "Nairobi", county: "Nairobi", status: "APPROVED" },
  images: [{ id: `photo-${index}` }],
}));
const reads: Array<{ select: string; ids?: string[] }> = [];
let failCards = false;
function query() {
  let rows = [...inventory];
  let total = rows.length;
  const read = { select: "" } as (typeof reads)[number];
  reads.push(read);
  const chain = {
    select(columns: string) { read.select = columns; return chain; },
    eq() { return chain; },
    in(field: string, values: string[]) {
      if (field === "id") { read.ids = values; rows = rows.filter((row) => values.includes(row.id)).reverse(); }
      return chain;
    },
    order(field: "price" | "created_at", { ascending }: { ascending: boolean }) {
      rows.sort((a, b) => String(a[field]).localeCompare(String(b[field]), undefined, { numeric: true }) * (ascending ? 1 : -1));
      return chain;
    },
    range(from: number, to: number) { total = rows.length; rows = rows.slice(from, to + 1); return chain; },
    then(resolve: (value: unknown) => unknown) {
      const cards = read.select.includes("images:");
      return Promise.resolve({
        data: cards ? rows : rows.map((row) => ({ ...row, images: undefined, dealer: read.select.includes("dealer:") ? row.dealer : undefined })), count: total,
        error: cards && failCards ? { code: "57014", message: "statement timeout" } : null,
      }).then(resolve);
    },
  };
  return chain;
}
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ from: query }) } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => null } });
mock.module("@/lib/data/membership", { namedExports: { getSellerPackageFeaturedPriority: () => 0 } });
const { searchListings, countMatchingListings } = await import("./listings");

test("ordinary searches page before card joins and preserve the requested sort", async () => {
  reads.length = 0;
  const result = await searchListings({ page: 2, limit: 5, sort: { field: "price", direction: "asc" } });
  const ids = [5, 6, 7, 8, 9].map((id) => `vehicle-${id}`);
  assert.equal(result.total, 40);
  assert.deepEqual(result.listings.map((row) => row.id), ids);
  assert.equal(reads[0].select, "id");
  assert.deepEqual(reads[1].ids, ids);
  assert.equal(result.listings[0].images?.length, 1);
});

test("derived searches count without card joins and hydrate only the ranked page", async () => {
  reads.length = 0;
  const filters = { featured: true };
  assert.equal(await countMatchingListings(filters), 20);
  assert.ok(reads.every((read) => !read.select.includes("images:") && !read.select.includes("seller:")));
  reads.length = 0;
  const result = await searchListings({ filters, page: 2, limit: 3, sort: { field: "price", direction: "asc" } });
  assert.equal(result.total, 20);
  assert.deepEqual(result.listings.map((row) => row.id), ["vehicle-6", "vehicle-8", "vehicle-10"]);
  assert.deepEqual(reads.at(-1)?.ids, ["vehicle-6", "vehicle-8", "vehicle-10"]);
});

test("a failed card read rejects the whole result so it cannot replace a good snapshot", async () => {
  failCards = true;
  const log = mock.method(console, "error", () => {});
  try {
    await assert.rejects(() => searchListings({ limit: 5 }), /Unable to load listing cards/);
  } finally {
    failCards = false;
    log.mock.restore();
  }
});

test("county and town searches retain the dealer location fallback for older listings", async () => {
  reads.length = 0;
  const filters = { county: "Nairobi", town: "Nairobi" };
  assert.equal(await countMatchingListings(filters), 40);
  assert.equal(reads[0].select, "*,dealer:public_dealers(status,city,county)");
  const result = await searchListings({ filters, limit: 5 });
  assert.equal(result.total, 40);
  assert.equal(result.listings.length, 5);
  assert.ok(reads.every((read) => read.ids || !read.select.includes("images:")));
});
