import assert from "node:assert/strict";
import test from "node:test";
import { applyListingFilters, filterAndRankListings } from "./listings";
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

test("car engine search matches numeric, litre and legacy capacity metadata at range boundaries", () => {
  const listings = [
    { ...listing("lower", false), metadata: { details: { engineCapacity: "1001" } } },
    { ...listing("upper", false), metadata: { engineCapacity: 1500 } },
    { ...listing("litres", false), metadata: { engine_displacement: "1.5L" } },
    { ...listing("legacy", false), metadata: { engine_cc: "1,500cc" } },
    { ...listing("too-small", false), metadata: { engineCapacity: 1000 } },
    { ...listing("too-large", false), metadata: { engineCapacity: 1501 } },
    { ...listing("unspecified", false), metadata: {} },
  ];

  assert.deepEqual(
    filterAndRankListings(listings, { engineCc: "1001-1500" }).map((item) => item.id),
    ["lower", "upper", "litres", "legacy"],
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


test("used-car browsing includes foreign and locally used vehicles without broadening specific conditions", () => {
  for (const [condition, expected] of [
    ["used", ["locally_used", "foreign_used", "used"]],
    ["locally_used", ["locally_used", "used"]],
    ["foreign_used", "foreign_used"],
    ["new", "new"],
  ] as const) {
    const calls: unknown[][] = [];
    const query = {
      or() { return this; },
      ilike() { return this; },
      gte() { return this; },
      lte() { return this; },
      in(column: string, values: string[]) { calls.push([column, values]); return this; },
      eq(column: string, value: string | number | boolean) { calls.push([column, value]); return this; },
      not() { return this; },
      is() { return this; },
    };
    applyListingFilters(query, { condition });
    assert.deepEqual(calls, [["condition", expected]]);
  }
});
