import assert from "node:assert/strict";
import test from "node:test";
import { findMatchingOwnerListing } from "./listing-submission";

test("finds the matching owner listing within the duplicate price tolerance", () => {
  const match = findMatchingOwnerListing(
    [
      { id: "different-price", price: 2_500_000, status: "active" },
      { id: "recoverable-draft", price: 3_000_000, status: "draft" },
    ],
    3_015_000
  );

  assert.deepEqual(match, {
    id: "recoverable-draft",
    price: 3_000_000,
    status: "draft",
  });
});

test("does not match a listing outside the one-percent price tolerance", () => {
  assert.equal(
    findMatchingOwnerListing(
      [{ id: "another-listing", price: 3_000_000, status: "active" }],
      3_030_000
    ),
    null
  );
});

test("keeps duplicate protection when both a draft and a live match exist", () => {
  const match = findMatchingOwnerListing(
    [
      { id: "recoverable-draft", price: 3_000_000, status: "draft" },
      { id: "live-listing", price: 3_000_000, status: "active" },
    ],
    3_000_000
  );

  assert.equal(match?.id, "live-listing");
});
