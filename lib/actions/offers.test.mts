import assert from "node:assert/strict";
import { mock, test } from "node:test";
let rpcError: { code: string; message: string } | null = null;
const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: { id: "approved-dealer" } }, error: null }) },
  rpc: async (name: string, args: Record<string, unknown>) => { calls.push({ name, args }); return { error: rpcError, data: { id: "existing-bid", listing_id: "vehicle" } }; },
}) } });
const { createListingOffer, updateOwnListingOffer } = await import("./offers");

test("duplicate live bids return friendly structured recovery without database identifiers", async () => {
  rpcError = { code: "23505", message: 'duplicate key value violates unique constraint "idx_listing_offers_one_live_per_dealer"' };
  const result = await createListingOffer({ listingId: "vehicle", amount: 2000 });
  assert.ok("error" in result);
  assert.equal(result.code, "BID_ALREADY_SUBMITTED");
  assert.equal(result.error, "You’ve already submitted a bid for this vehicle. You can update your existing bid instead of submitting a new one.");
  assert.ok(!result.error.includes("idx_"));
});

test("dealer bid update rejects invalid input before RPC and updates only the supplied existing offer", async () => {
  const before = calls.length;
  await updateOwnListingOffer({ offerId: "existing-bid", amount: Number.NaN });
  await updateOwnListingOffer({ offerId: "", amount: 2000 });
  assert.equal(calls.length, before);
  rpcError = null;
  assert.deepEqual(await updateOwnListingOffer({ offerId: " existing-bid ", amount: 2300, message: " Revised bid " }), { success: true, offer: { id: "existing-bid", listing_id: "vehicle" } });
  assert.deepEqual(calls.at(-1), { name: "update_own_listing_offer", args: { p_offer_id: "existing-bid", p_amount: 2300, p_message: "Revised bid" } });
});
