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

test("county-wide results include mapped legacy towns and explicit custom towns; town refines exactly", () => {
  const located = (id: string, metadata: Record<string, string>, dealerCity?: string) => ({
    ...listing(id, false), metadata, dealer: dealerCity ? { id: "sample-dealer", city: dealerCity } : null,
  }) as Listing;
  const rows = [
    located("thika", { cityTown: "Thika" }),
    located("ruiru", { cityTown: "Ruiru" }),
    located("custom", { county: "Kiambu", cityTown: "Custom Town" }),
    located("dealer", {}, "Thika"),
    located("nakuru", { county: "Nakuru", cityTown: "Nakuru", locationArea: "Near Kiambu Road" }),
    located("foreign", { country: "Uganda", cityTown: "Thika" }),
    located("override", { county: "Nakuru", cityTown: "Thika" }),
    located("substring", { cityTown: "Thika Road" }),
  ];
  const ids = (filters: Parameters<typeof filterAndRankListings>[1]) => filterAndRankListings(rows, filters).map((row) => row.id);
  assert.deepEqual(ids({ county: "Kiambu" }), ["thika", "ruiru", "custom", "dealer"]);
  assert.deepEqual(ids({ county: "Kiambu", town: "Thika" }), ["thika", "dealer"]);
  assert.deepEqual(ids({ county: "Kiambu", town: "Custom Town" }), ["custom"]);
  assert.deepEqual(ids({ town: "Ruiru" }), ["ruiru"]);
  assert.deepEqual(ids({ county: "kiambu" }), ["thika", "ruiru", "custom", "dealer"]);
  // Existing single-location URLs retain their substring semantics.
  assert.ok(ids({ location: "Thika" }).includes("substring"));
});

test("county search uses explicit dealer county for a custom dealer town when listing location is absent", () => {
  const row = { ...listing("custom-dealer", false), metadata: {}, dealer: { id: "sample-dealer", city: "Custom Town", county: "Kiambu" } } as Listing;
  assert.equal(filterAndRankListings([row], { county: "Kiambu" }).length, 1);
  assert.equal(filterAndRankListings([row], { county: "Nakuru" }).length, 0);
  assert.equal(filterAndRankListings([row], { county: "Kiambu", town: "Custom Town" }).length, 1);
});


test("verified-only results require explicit dealer approval even for owner sessions", () => {
  const rows = ["PENDING", "REJECTED", "APPROVED", undefined].map((status, index) => ({
    ...listing(`dealer-${index}`, false), dealer: { id: `sample-dealer-${index}`, status },
  } as Listing));
  rows.push(listing("private-seller", false));
  assert.deepEqual(filterAndRankListings(rows, { verifiedOnly: true }).map((row) => row.id), ["dealer-2"]);
  assert.equal(filterAndRankListings(rows).length, rows.length);
});
