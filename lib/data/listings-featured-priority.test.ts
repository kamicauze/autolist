import assert from "node:assert/strict";
import test from "node:test";
import { sortFeaturedListingsBySubscriptionPriority } from "./listings";
import type { Listing } from "@/lib/types/listing";

function listing(id: string, sellerId: string, createdAt: string) {
  return {
    id,
    seller_id: sellerId,
    created_at: createdAt,
  } as Listing;
}

test("featured listings sort by seller subscription priority before recency", () => {
  const listings = [
    listing("starter-new", "starter", "2026-09-09T10:00:00.000Z"),
    listing("enterprise-old", "enterprise", "2026-09-01T10:00:00.000Z"),
    listing("professional", "professional", "2026-09-08T10:00:00.000Z"),
    listing("standard-newest", "standard", "2026-09-10T10:00:00.000Z"),
  ];
  const priorityBySellerId = new Map([
    ["enterprise", 300],
    ["professional", 200],
    ["starter", 100],
  ]);

  assert.deepEqual(
    sortFeaturedListingsBySubscriptionPriority(listings, priorityBySellerId).map(({ id }) => id),
    ["enterprise-old", "professional", "starter-new", "standard-newest"]
  );
});

test("featured listings with equal priority keep newest first", () => {
  const listings = [
    listing("older", "seller-a", "2026-09-08T10:00:00.000Z"),
    listing("newer", "seller-b", "2026-09-09T10:00:00.000Z"),
  ];

  assert.deepEqual(
    sortFeaturedListingsBySubscriptionPriority(listings, new Map()).map(({ id }) => id),
    ["newer", "older"]
  );
});
