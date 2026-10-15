import assert from "node:assert/strict";
import { mock, test } from "node:test";

let userId = "listing-owner";
let listing = { id: "listing-sample", seller_id: "listing-owner", dealer_id: null, assigned_agent_id: null, status: "draft", make: "Toyota", model: "Corolla", year: 2020, price: 0, condition: null as string | null, metadata: {} };
const updates: Array<Record<string, unknown>> = [];
let imageReads = 0;
const client = {
  auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
  from(table: string) {
    let update: Record<string, unknown> | null = null;
    if (table === "listing_images") imageReads++;
    const chain = {
      select() { return chain; }, eq() { return chain; },
      update(value: Record<string, unknown>) { update = value; updates.push(value); return chain; },
      maybeSingle: async () => ({ data: table === "profiles" ? { role: "buyer" } : update ? { status: update.status } : listing, error: null }),
      then(resolve: (result: unknown) => unknown) { return Promise.resolve({ data: null, count: 3, error: null }).then(resolve); },
    };
    return chain;
  },
};
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
mock.module("@/lib/supabase/admin", { namedExports: { createAdminClient: () => { throw Error("Privileged client unexpected"); } } });
mock.module("next/cache", { namedExports: { revalidatePath() {} } });
mock.module("@/lib/admin/guard", { namedExports: { requireAdminAction: async () => ({ error: "Unauthorized" }) } });
mock.module("@/lib/data/sales-agent-permissions", { namedExports: { getSalesAgentViewerContext: async () => null } });
mock.module("@/lib/data/listings", { namedExports: { getActiveSubscriptionPriorityBySellerId: async () => new Map() } });
mock.module("@/lib/server/notifications", { namedExports: { buildListingTitle: () => "Listing sample", emitNotificationEvent: async () => null } });
mock.module("@/lib/server/listing-image-pipeline", { namedExports: { computeListingImageHashes() {}, renderListingImageVariants() {}, storeListingImageVariants() {} } });
mock.module("@/lib/server/listing-media-upload", { namedExports: Object.fromEntries(["createListingMediaUploadTicket", "discardListingImageAssets", "discardListingMediaUploads", "getFinalListingMediaObjectKey", "promoteListingMediaUpload", "readListingMediaUpload"].map((name) => [name, () => null])) });
const { updateListing, submitListingForReview } = await import("./listings");
const failure = (result: object) => "error" in result ? String(result.error) : "";

test("final submission rejects incomplete persisted commercial fields before media/status writes", async () => {
  assert.match(failure(await submitListingForReview(listing.id)), /condition.*positive price/);
  assert.equal(imageReads, 0);
  listing = { ...listing, price: 1000000 };
  assert.ok(failure(await submitListingForReview(listing.id)));
  listing = { ...listing, condition: "locally_used", price: 0 };
  assert.ok(failure(await submitListingForReview(listing.id)));
  assert.equal(updates.length, 0);
  listing = { ...listing, price: 1000000 };
  assert.equal((await submitListingForReview(listing.id)).success, true);
  assert.equal(updates.at(-1)?.status, "pending");
});

test("partial edits retain their contract while supplied condition/price are validated", async () => {
  const before = updates.length;
  assert.equal((await updateListing(listing.id, { price: 0 })).error, "Price must be positive.");
  assert.equal((await updateListing(listing.id, { condition: "" as never })).error, "Select a valid condition.");
  assert.equal(updates.length, before);
  assert.equal((await updateListing(listing.id, { description: "Partial draft edit remains supported" })).success, true);
  assert.equal((await updateListing(listing.id, { condition: "used" as never, price: 900000 })).success, true);
  assert.equal(updates.at(-1)?.condition, "locally_used");
  assert.equal(updates.at(-1)?.price, 900000);
});

test("ownership access checks remain ahead of editing and publication validation", async () => {
  userId = "unrelated-buyer";
  const before = updates.length;
  assert.match(String((await updateListing(listing.id, { price: 0 })).error), /not editable/);
  assert.match(failure(await submitListingForReview(listing.id)), /not editable/);
  assert.equal(updates.length, before);
});
