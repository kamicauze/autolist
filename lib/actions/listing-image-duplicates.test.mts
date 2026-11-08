import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { ListingMediaUploadReference } from "@/lib/listing-media-upload";

let userId = "photo-owner";
let storedHash = "different-file";
const replacements: Array<{ images: Array<{ image_hash: string; perceptual_hash: string }> }> = [];
const discarded: string[] = [];
let mediaReads = 0;
const listing = { id: "photo-listing", seller_id: "photo-owner", dealer_id: null, status: "draft", metadata: {} };
const client = {
  auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
  from(table: string) {
    let otherListings = false;
    const chain = {
      select() { return chain; }, eq() { return chain; },
      neq(column: string, value: string) {
        assert.equal(column, "listing_id");
        assert.equal(value, listing.id);
        otherListings = true;
        return chain;
      },
      maybeSingle: async () => ({ data: table === "profiles" ? { role: "buyer" } : listing, error: null }),
      then(resolve: (value: unknown) => unknown) {
        return Promise.resolve({ data: otherListings ? [{ image_hash: storedHash, perceptual_hash: "0000000000000000" }] : [], error: null }).then(resolve);
      },
    };
    return chain;
  },
  async rpc(name: string, args: typeof replacements[number]) {
    assert.equal(name, "replace_listing_gallery");
    replacements.push(args);
    return { error: null };
  },
};
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
mock.module("@/lib/supabase/admin", { namedExports: { createAdminClient: () => { throw Error("Privileged client unexpected"); } } });
mock.module("next/cache", { namedExports: { revalidatePath() {} } });
mock.module("@/lib/admin/guard", { namedExports: { requireAdminAction: async () => ({ error: "Unauthorized" }) } });
mock.module("@/lib/data/sales-agent-permissions", { namedExports: { getSalesAgentViewerContext: async () => null } });
mock.module("@/lib/data/listings", { namedExports: { getActiveSubscriptionPriorityBySellerId: async () => new Map() } });
mock.module("@/lib/server/notifications", { namedExports: { buildListingTitle: () => "Photo fixture", emitNotificationEvent: async () => null } });
mock.module("@/lib/server/listing-image-pipeline", { namedExports: {
  computeListingImageHashes: async (bytes: Buffer) => ({ hash: bytes.toString(), perceptualHash: "0000000000000000" }),
  renderListingImageVariants: async () => [], storeListingImageVariants: async () => {},
} });
mock.module("@/lib/server/listing-media-upload", { namedExports: {
  createListingMediaUploadTicket() {},
  discardListingImageAssets: async () => {},
  discardListingMediaUploads: async () => { discarded.push("uploads"); },
  getFinalListingMediaObjectKey: (_: string, upload: ListingMediaUploadReference) => upload.key,
  promoteListingMediaUpload: async () => {},
  readListingMediaUpload: async (_: string, upload: ListingMediaUploadReference) => { mediaReads++; return Buffer.from(upload.name); },
} });
const { finalizeListingImageUploads } = await import("./listings");
const uploads: ListingMediaUploadReference[] = ["front.jpg", "rear.jpg", "interior.jpg"].map((name, index) => ({
  clientId: `photo-${index}`, kind: "image", name, size: 100, contentType: "image/jpeg", lastModified: index + 1,
  key: `listings/${listing.id}/uploads/image/${name}`,
}));

test("different files with identical perceptual hashes can finalize all three photos", async () => {
  assert.equal((await finalizeListingImageUploads(listing.id, uploads, "Photo fixture")).success, true);
  assert.equal(replacements.length, 1);
  assert.deepEqual(replacements[0].images.map((image) => image.image_hash), uploads.map((upload) => upload.name));
  assert.ok(replacements[0].images.every((image) => image.perceptual_hash === "0000000000000000"));
});

test("an exact file reused in another listing still rejects without replacing the gallery", async () => {
  storedHash = uploads[0].name;
  const result = await finalizeListingImageUploads(listing.id, uploads, "Photo fixture");
  assert.equal(result.error, 'Duplicate image detected for "front.jpg".');
  assert.equal(replacements.length, 1);
  assert.deepEqual(discarded, ["uploads"]);
});

test("unrelated users and galleries below the minimum cannot process uploads", async () => {
  const before = mediaReads;
  userId = "other-seller";
  assert.match(String((await finalizeListingImageUploads(listing.id, uploads, "Photo fixture")).error), /not editable/);
  userId = listing.seller_id;
  assert.match(String((await finalizeListingImageUploads(listing.id, uploads.slice(0, 2), "Photo fixture")).error), /three/);
  assert.equal(mediaReads, before);
  assert.equal(replacements.length, 1);
});
