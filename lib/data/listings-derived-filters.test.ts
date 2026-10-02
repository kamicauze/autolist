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

function driveListing(id: string, make: string, model: string, driveType: string | null) {
  return {
    ...listing(id, false),
    make,
    model,
    drive_type: driveType,
  } as Listing;
}

test("derived search filters group drive types under 2WD and 4WD", () => {
  const listings = [
    driveListing("two", "Toyota", "Axio", "2wd"),
    driveListing("front", "Mazda", "Demio", "FWD"),
    driveListing("four", "Toyota", "Hilux", "4wd"),
    driveListing("all", "Subaru", "Forester", null),
    driveListing("unknown", "Nissan", "Note", null),
  ];

  assert.deepEqual(
    filterAndRankListings(listings, { driveType: "2WD" }).map((item) => item.id),
    ["two", "front"],
  );
  assert.deepEqual(
    filterAndRankListings(listings, { driveType: "4WD" }).map((item) => item.id),
    ["four", "all"],
  );
});
