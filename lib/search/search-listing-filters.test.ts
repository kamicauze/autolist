import assert from "node:assert/strict";
import test from "node:test";
import { parseSearchListingFilters } from "./search-listing-filters";

const query =
  "category=plant_construction&hoursMax=3000&featured=true&engineCc=150-500&taxCategory=Excavators&bodyType=a,b&minPrice=100";

test("URLSearchParams and page record parse to the same filters", () => {
  const fromUrl = parseSearchListingFilters(new URLSearchParams(query));
  const fromRecord = parseSearchListingFilters(Object.fromEntries(new URLSearchParams(query)));
  assert.deepEqual(fromUrl, fromRecord);
});

test("parses filters the old count route ignored", () => {
  const filters = parseSearchListingFilters(new URLSearchParams(query));
  assert.equal(filters.maxHours, 3000);
  assert.equal(filters.featured, true);
  assert.equal(filters.engineCc, "150-500");
  assert.equal(filters.taxonomyCategory, "Excavators");
  assert.deepEqual(filters.bodyType, ["a", "b"]);
  assert.equal(filters.minPrice, 100);
});

test("truck-only filters are dropped outside the truck category", () => {
  const params = "axleConfig=6x4&gvmMin=18000";
  assert.equal(parseSearchListingFilters(new URLSearchParams(`category=car&${params}`)).axleConfig, undefined);
  const truck = parseSearchListingFilters(new URLSearchParams(`category=truck&${params}`));
  assert.equal(truck.axleConfig, "6x4");
  assert.equal(truck.minGvmKg, 18000);
});

test("unknown category is ignored", () => {
  assert.equal(parseSearchListingFilters({ category: "spaceship" }).category, undefined);
});
