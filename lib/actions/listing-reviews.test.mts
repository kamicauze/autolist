import assert from "node:assert/strict";
import { mock, test } from "node:test";

let role: string | null = "buyer";
let profileError = false;
let sellerId = "another-seller";
let listingReads = 0;
let writes = 0;
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: { id: "sample-buyer" } }, error: null }) },
  from: (table: string) => ({
    select() { return this; },
    eq() { return this; },
    maybeSingle: async () => {
      if (table === "profiles") return { data: profileError ? null : { role }, error: profileError ? new Error("Unavailable") : null };
      listingReads++;
      return { data: { id: "sample-listing", seller_id: sellerId }, error: null };
    },
    upsert: async () => { writes++; return { error: null }; },
  }),
}) } });
const { upsertListingReview } = await import("./listing-reviews");
const input = { listingId: "sample-listing", rating: 4, body: "Clear information and a helpful seller." };

test("both administrator roles are rejected before listing reads or writes", async () => {
  for (const adminRole of ["admin", "super_admin"]) {
    role = adminRole;
    assert.deepEqual(await upsertListingReview(input), { error: "Administrators cannot post listing reviews." });
  }
  assert.equal(listingReads, 0);
  assert.equal(writes, 0);
});

test("failed role lookup does not permit a review", async () => {
  profileError = true;
  assert.match((await upsertListingReview(input)).error!, /Unable to verify review permissions/);
  assert.equal(writes, 0);
  profileError = false;
});

test("a buyer can still submit a real review but cannot review their own listing", async () => {
  role = "buyer";
  assert.deepEqual(await upsertListingReview(input), { success: true });
  assert.equal(writes, 1);
  sellerId = "sample-buyer";
  assert.deepEqual(await upsertListingReview(input), { error: "You cannot review your own listing." });
  assert.equal(writes, 1);
});
