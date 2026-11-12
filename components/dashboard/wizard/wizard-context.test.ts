import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DRAFT_STORAGE_KEY, getListingDraftStorageKey } from "./wizard-context";

const wizardSource = readFileSync(new URL("./wizard-context.tsx", import.meta.url), "utf8");

test("new-listing drafts are scoped to the signed-in user", () => {
  const userA = getListingDraftStorageKey({ userId: "user-a" });
  const userB = getListingDraftStorageKey({ userId: "user-b" });

  assert.equal(userA, "autolist_listing_draft:new:user-a");
  assert.notEqual(userA, userB);
  assert.notEqual(userA, DRAFT_STORAGE_KEY);
  assert.equal(getListingDraftStorageKey({ userId: null }), null);
  assert.equal(getListingDraftStorageKey({}), null);
});

test("edit drafts keep their per-listing key and never collide with new drafts", () => {
  const listingId = "4f2b7a7e-8c3d-4f7e-9a51-0d1c2b3a4e5f";

  assert.equal(
    getListingDraftStorageKey({ listingId, userId: "user-a" }),
    `autolist_listing_draft:${listingId}`
  );
  assert.notEqual(
    getListingDraftStorageKey({ listingId: "new" }),
    getListingDraftStorageKey({ userId: "new" })
  );
});

test("the unscoped legacy draft is deleted on load and never offered for resume", () => {
  assert.match(wizardSource, /localStorage\.removeItem\(DRAFT_STORAGE_KEY\)/);
  assert.doesNotMatch(wizardSource, /localStorage\.getItem\(DRAFT_STORAGE_KEY\)/);
  assert.match(wizardSource, /if \(!draftOwnerResolved\) return;/);
});
