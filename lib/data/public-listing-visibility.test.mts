import assert from "node:assert/strict";
import { mock, test } from "node:test";

const inventory = [
  { id: "public-standard", sale_channel: "standard", status: "active", category: "car", seller_id: "seller", dealer_id: "dealer", is_featured: true, make: "Toyota", body_type: "SUV", created_at: "2026-10-15T10:00:00Z", metadata: {}, images: [] },
  { id: "public-dealer", sale_channel: "dealer_public", status: "active", category: "car", seller_id: "seller", dealer_id: "dealer", is_featured: true, make: "Toyota", body_type: "SUV", created_at: "2026-10-15T09:00:00Z", metadata: {}, images: [] },
  { id: "private-request", sale_channel: "dealer_only", status: "active", category: "car", seller_id: "seller", dealer_id: "dealer", is_featured: true, make: "Toyota", body_type: "SUV", created_at: "2026-10-15T08:00:00Z", metadata: {}, images: [] },
].map((row) => ({ ...row, dealer: { id: "dealer", name: "Sample Motors", logo_url: null, city: "Nairobi", status: row.id === "public-standard" ? "PENDING" : "APPROVED" } }));
const queryTables: string[] = [];
function query(table: string) {
  queryTables.push(table);
  let items = table === "listings" ? [...inventory] : [];
  let single = false;
  let selectedColumns = "";
  const result = () => {
    const rows = items.map((row) => ({ ...row, dealer: selectedColumns.includes("dealer:public_dealers(") ? row.dealer : undefined }));
    return { data: single ? rows[0] || null : rows, error: null, count: rows.length };
  };
  const chain = {
    select(columns: string) { selectedColumns = columns; return chain; },
    eq(field: string, value: unknown) { items = items.filter(row => row[field as keyof typeof row] === value); return chain; },
    neq(field: string, value: unknown) { items = items.filter(row => row[field as keyof typeof row] !== value); return chain; },
    in(field: string, values: unknown[]) { items = items.filter(row => values.includes(row[field as keyof typeof row])); return chain; },
    order() { return chain; }, limit() { return chain; }, range() { return chain; }, or() { return chain; },
    single() { single = true; return chain; },
    then(resolve: (value: ReturnType<typeof result>) => unknown) { return Promise.resolve(result()).then(resolve); },
  };
  return chain;
}
mock.module("server-only", { namedExports: {} });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ from: query }) } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => null, createAdminClient: () => { throw new Error("Privileged client forbidden"); } } });
mock.module("@/lib/data/membership", { namedExports: { getSellerPackageFeaturedPriority: () => 0 } });
const listings = await import("./listings");
const { getDealerInventory } = await import("./dealers");

test("public marketplace reads exclude dealer-only rows even when session RLS permits them", async () => {
  const expectPublic = (rows: Array<{ id: string }>) => assert.deepEqual(rows.map(row => row.id).sort(), ["public-dealer", "public-standard"]);
  expectPublic(await listings.getNewestListings());
  expectPublic(await listings.getFeaturedListings());
  expectPublic((await listings.searchListings({})).listings);
  expectPublic((await listings.searchListings({ filters: { category: "car" } })).listings);
  assert.equal(await listings.countMatchingListings(), 2);
  assert.equal(await listings.countMatchingListings({ category: "car" }), 2);
  expectPublic(await listings.getListingsByIds(inventory.map(row => row.id)));
  expectPublic(await listings.getSimilarListings({ ...inventory[0], id: "source" } as never));
  const dealerInventory = await getDealerInventory("dealer");
  expectPublic(dealerInventory.listings);
  assert.equal(dealerInventory.total, 2);
  assert.equal(await listings.getListingById("private-request"), null);
  assert.equal((await listings.getListingById("public-standard"))?.id, "public-standard");
  assert.ok(queryTables.every(table => table === "listings"));
});


test("recommended listings retain dealer identity independently of verification", async () => {
  const { getListingCardProps } = await import("../utils/listing-card-props");
  const recommendations = await listings.getSimilarListings({ ...inventory[0], id: "source" } as never);
  assert.equal(recommendations.length, 2);
  for (const row of recommendations) {
    const card = getListingCardProps(row);
    assert.equal(card.sellerLabel, "Dealer: Sample Motors");
    assert.equal(card.contactKind, "call");
    assert.equal(card.dealer?.isVerified, row.id === "public-dealer");
    assert.equal(Boolean(card.dealer?.href), row.id === "public-dealer");
  }
});
