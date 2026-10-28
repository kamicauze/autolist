import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
const listingId = "10000000-0000-4000-8000-000000000001";
const viewerId = "20000000-0000-4000-8000-000000000001";
let user: { id: string } | null;
let listing: { seller_id: string; status: string; sale_channel: string } | null;
let ua: string;
let cookie: string | undefined;
let writes: Record<string, unknown>[];
let cookieWrites: unknown[];
let fail: boolean;
let authError: { name: string } | null;
mock.module("next/headers", { namedExports: {
  headers: async () => ({ get: () => ua }),
  cookies: async () => ({ get: () => cookie ? { value: cookie } : undefined, set: (...args: unknown[]) => { cookieWrites.push(args); cookie = String(args[1]); } }),
} });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error: authError }) } }) } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => ({ from: () => {
  if (fail) throw new Error("Unavailable");
  const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: listing, error: null }),
    upsert: async (values: Record<string, unknown>, options: unknown) => { writes.push({ values, options }); return { error: null }; } };
  return q;
} }) } });
const { recordListingInteraction } = await import("./listing-interactions");
beforeEach(() => { user = null; listing = { seller_id: "owner", status: "active", sale_channel: "dealer_public" }; ua = "Mozilla/5.0"; cookie = viewerId; writes = []; cookieWrites = []; fail = false; authError = { name: "AuthSessionMissingError" }; });
test("valid clicks use server identity and database daily deduplication", async () => {
  for (const interaction of ["call", "financing"]) await recordListingInteraction({ listingId, interaction, viewer_key: "spoofed" });
  assert.equal(writes.length, 2);
  assert.deepEqual(writes[0], { values: { listing_id: listingId, interaction_type: "call", viewer_key: `a:${viewerId}` }, options: { onConflict: "listing_id,interaction_type,viewer_key,interacted_on", ignoreDuplicates: true } });
  assert.equal(cookieWrites.length, 0);
});
test("anonymous identity is replaced when malformed; signed-in identity cannot be supplied by the client", async () => {
  cookie = "bad";
  await recordListingInteraction({ listingId, interaction: "call" });
  assert.equal(cookieWrites.length, 1);
  assert.match(cookie!, /^[0-9a-f-]{36}$/);
  user = { id: "buyer" };
  await recordListingInteraction({ listingId, interaction: "financing" });
  assert.equal((writes[1].values as Record<string, unknown>).viewer_key, "u:buyer");
});
test("invalid, unavailable, private, inactive, owner and bot clicks never write", async () => {
  for (const input of [null, { listingId: "bad", interaction: "call" }, { listingId, interaction: "other" }]) await recordListingInteraction(input);
  ua = "HeadlessChrome"; await recordListingInteraction({ listingId, interaction: "call" }); ua = "Mozilla/5.0";
  user = { id: "owner" }; await recordListingInteraction({ listingId, interaction: "call" }); user = null;
  listing!.status = "pending"; await recordListingInteraction({ listingId, interaction: "call" }); listing!.status = "active";
  listing!.sale_channel = "dealer_only"; await recordListingInteraction({ listingId, interaction: "call" });
  listing = null; await recordListingInteraction({ listingId, interaction: "call" });
  fail = true; await assert.doesNotReject(() => recordListingInteraction({ listingId, interaction: "call" }));
  assert.equal(writes.length, 0);
});

test("unexpected authentication failures do not record anonymous traffic", async () => {
  authError = { name: "AuthRetryableFetchError" };
  await recordListingInteraction({ listingId, interaction: "call" });
  assert.equal(writes.length, 0);
});
