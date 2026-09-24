import assert from "node:assert/strict";
import test from "node:test";
import { filterAndRankListings } from "./listings";
import type { Listing } from "@/lib/types/listing";

function listing(id: string, isFeatured: boolean) {
  return {
    id,
    is_featured: isFeatured,
    created_at: "2026-09-01T00:00:00.000Z",
  } as Listing;
}

test("derived search filters keep listing order when no filters apply", () => {
  const listings = [listing("a", false), listing("b", true)];

  assert.deepEqual(
    filterAndRankListings(listings).map((item) => item.id),
    ["a", "b"],
  );
});

test("derived search filters drop non-featured listings for featured searches", () => {
  const listings = [listing("a", false), listing("b", true), listing("c", true)];

  assert.deepEqual(
    filterAndRankListings(listings, { featured: true }).map((item) => item.id),
    ["b", "c"],
  );
});
