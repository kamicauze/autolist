import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server";

let failure: { code: string; message: string } | null = null;
const selections: Array<{ columns: string; options: unknown }> = [];
function query() {
  const chain = {
    select(columns: string, options: unknown) { selections.push({ columns, options }); return chain; },
    eq() { return chain; }, in() { return chain; }, or() { return chain; },
    order() { return chain; }, range() { return chain; }, limit() { return chain; },
    then(resolve: (value: unknown) => unknown) {
      return Promise.resolve({ data: failure ? null : [], count: failure ? null : 0, error: failure }).then(resolve);
    },
  };
  return chain;
}
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ from: query }) } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => null } });
mock.module("@/lib/data/membership", { namedExports: { getSellerPackageFeaturedPriority: () => 0 } });
const { searchListings, countMatchingListings, getNewestListings, getFeaturedListings } = await import("./listings");
const { GET } = await import("../../app/api/listings/count/route");

test("database timeouts reject ordinary and derived reads instead of returning empty inventory", async () => {
  failure = { code: "57014", message: "canceling statement due to statement timeout" };
  const log = mock.method(console, "error", () => {});
  try {
    for (const read of [
      () => searchListings({}),
      () => searchListings({ filters: { category: "car" } }),
      () => countMatchingListings(),
      () => countMatchingListings({ category: "car" }),
      () => getNewestListings(),
      () => getFeaturedListings(),
    ]) {
      await assert.rejects(read, (error: Error) => error.cause === failure);
    }
    const response = await GET(new NextRequest("https://autolist.co.ke/api/listings/count"));
    assert.equal(response.status, 503);
    assert.equal("count" in await response.json(), false);
  } finally {
    log.mock.restore();
    failure = null;
  }
});

test("successful empty reads stay empty, and counts fetch only fields needed for filtering", async () => {
  const before = selections.length;
  assert.deepEqual(await getNewestListings(0), []);
  assert.equal(selections.length, before);
  assert.deepEqual(await searchListings({}), { listings: [], total: 0 });
  assert.deepEqual(await getNewestListings(), []);
  assert.equal(await countMatchingListings(), 0);
  assert.deepEqual(selections.at(-1), { columns: "id", options: { count: "exact", head: true } });
  const response = await GET(new NextRequest("https://autolist.co.ke/api/listings/count"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { count: 0 });
});
