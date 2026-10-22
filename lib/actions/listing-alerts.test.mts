import assert from "node:assert/strict";
import { mock, test } from "node:test";

const writes: Record<string, unknown>[] = [];
const ownershipFilters: unknown[][] = [];
const client = {
  auth: { getUser: async () => ({ data: { user: { id: "alert-owner" } }, error: null }) },
  from(table: string) {
    assert.equal(table, "listing_alerts");
    const chain = {
      select: () => chain,
      eq: (...args: unknown[]) => { ownershipFilters.push(args); return chain; },
      insert: (value: Record<string, unknown>) => { writes.push(value); return chain; },
      update: (value: Record<string, unknown>) => { writes.push(value); return chain; },
      single: async () => ({ data: { id: "saved-alert", ...writes.at(-1) }, error: null }),
      maybeSingle: async () => ({ data: { id: "saved-alert", ...writes.at(-1) }, error: null }),
      then: (resolve: (value: unknown) => void) => resolve({ count: 0, error: null }),
    };
    return chain;
  },
};
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
mock.module("@/lib/data/listing-alerts", { namedExports: { toListingAlertRecord: (row: unknown) => row } });
const { createListingAlert, updateListingAlert } = await import("./listing-alerts");

const input = {
  category: "car" as const, minPrice: "1498500", maxPrice: "2300000",
  primaryValue: "any", secondaryValue: "any", emailEnabled: false, priceDropEnabled: true,
};

test("create and edit persist exact price bounds and preserve ownership guards", async () => {
  assert.equal((await createListingAlert(input)).success, true);
  assert.equal(writes[0].min_price, 1498500);
  assert.equal(writes[0].max_price, 2300000);
  assert.equal(writes[0].user_id, "alert-owner");
  assert.equal((await updateListingAlert("saved-alert", { ...input, minPrice: "", maxPrice: "5000000" })).success, true);
  assert.equal(writes[1].min_price, null);
  assert.equal(writes[1].max_price, 5000000);
  assert.notEqual(writes[0].fingerprint, writes[1].fingerprint);
  assert.ok(ownershipFilters.some(([key, value]) => key === "user_id" && value === "alert-owner"));
  assert.equal((await createListingAlert({ ...input, minPrice: "3000000" })).success, false);
  assert.equal(writes.length, 2);
});
