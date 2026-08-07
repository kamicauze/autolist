import assert from "node:assert/strict";
import {
  getSearchFilterConfig,
  isSearchFilterVisible,
  type SearchFilterId,
} from "./search-filter-config";

const truckOnlyFilters: SearchFilterId[] = [
  "axleConfig",
  "gvm",
  "cabType",
  "enginePower",
];

for (const filter of truckOnlyFilters) {
  assert.equal(
    isSearchFilterVisible("truck", filter),
    true,
    `${filter} should be visible for truck searches`
  );
}

for (const category of [
  "car",
  "van",
  "motorbike",
  "plant_construction",
  "farm_agricultural",
] as const) {
  for (const filter of truckOnlyFilters) {
    assert.equal(
      isSearchFilterVisible(category, filter),
      false,
      `${filter} should be hidden for ${category}`
    );
  }
}

assert.equal(isSearchFilterVisible("truck", "seats"), false);
assert.equal(isSearchFilterVisible("truck", "doors"), false);
assert.equal(isSearchFilterVisible("farm_agricultural", "bodyType"), false);
assert.equal(isSearchFilterVisible("plant_construction", "engineCc"), false);
assert.ok(getSearchFilterConfig("truck").visible.includes("taxonomy"));
