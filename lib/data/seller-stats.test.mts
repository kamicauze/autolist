import assert from "node:assert/strict";
import { mock, test } from "node:test";

const queries: Array<{ table: string; filters: Array<[string, string, unknown]> }> = [];
let available = true;
mock.module("@/lib/data/reviews", { namedExports: { getPublicSellerReviewsData: async () => ({
  reviews: [], summary: { averageRating: 2.5, totalReviews: 2 },
}) } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => available ? {
  from: (table: string) => {
    const query = { table, filters: [] as Array<[string, string, unknown]> };
    queries.push(query);
    return {
      select() { return this; },
      eq(column: string, value: unknown) { query.filters.push(["eq", column, value]); return this; },
      neq(column: string, value: unknown) { query.filters.push(["neq", column, value]); return this; },
      is(column: string, value: unknown) { query.filters.push(["is", column, value]); return this; },
      maybeSingle: async () => ({ data: { created_at: "2024-01-01T00:00:00Z" }, error: null }),
      then(resolve: (value: { count: number; error: null }) => unknown) { return Promise.resolve(resolve({ count: 3, error: null })); },
    };
  },
} : null } });
const { getListingSellerStats } = await import("./seller-stats");

test("private seller statistics use real review totals and count only public active private listings", async () => {
  assert.deepEqual(await getListingSellerStats({ seller_id: "sample-seller", dealer_id: null }), {
    averageRating: 2.5, totalReviews: 2, memberSince: "2024-01-01T00:00:00Z", activeListings: 3,
  });
  assert.deepEqual(queries.find((query) => query.table === "listings")?.filters, [
    ["eq", "status", "active"], ["neq", "sale_channel", "dealer_only"],
    ["eq", "seller_id", "sample-seller"], ["is", "dealer_id", null],
  ]);
});

test("dealer statistics use the dealership join date and listing ownership", async () => {
  queries.length = 0;
  await getListingSellerStats({ seller_id: "sample-owner", dealer_id: "sample-dealer" });
  assert.deepEqual(queries.find((query) => query.table === "dealers")?.filters, [["eq", "id", "sample-dealer"]]);
  assert.deepEqual(queries.find((query) => query.table === "listings")?.filters, [
    ["eq", "status", "active"], ["neq", "sale_channel", "dealer_only"], ["eq", "dealer_id", "sample-dealer"],
  ]);
});

test("missing privileged client omits statistics rather than inventing them", async () => {
  available = false;
  assert.equal(await getListingSellerStats({ seller_id: "sample-seller", dealer_id: null }), null);
});
