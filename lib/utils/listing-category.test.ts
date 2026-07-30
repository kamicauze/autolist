import assert from "node:assert/strict";
import test from "node:test";

import {
  getListingBodyType,
  getListingCardSpecs,
  getCategoryFilterConfig,
  getListingDisplayType,
  getPersistedListingDetails,
  resolveListingCategory,
} from "./listing-category";
import {
  FARM_CATEGORY_OPTIONS,
  getFarmSubcategoryOptions,
} from "../constants/farm-taxonomy";

test("maps navigation tab values to persisted listing categories", () => {
  const cases = [
    ["cars", "car"],
    ["vans", "van"],
    ["bikes", "motorbike"],
    ["motorbikes", "motorbike"],
    ["electric bikes", "motorbike"],
    ["trucks", "truck"],
    ["farm", "farm_agricultural"],
    ["plant", "plant_construction"],
    ["plant-machinery", "plant_construction"],
  ] as const;

  for (const [type, expected] of cases) {
    assert.equal(resolveListingCategory(type), expected);
  }
});

test("returns no category for unsupported navigation types", () => {
  assert.equal(resolveListingCategory(undefined), undefined);
  assert.equal(resolveListingCategory("motorhomes"), undefined);
});

test("maps category-specific form subtype fields to the listing display field", () => {
  assert.equal(getListingBodyType({ bodyType: "tipper" }), "tipper");
  assert.equal(getListingBodyType({ bodyStyle: "panel_van" }), "panel_van");
  assert.equal(getListingBodyType({ bikeType: "sport" }), "sport");
  assert.equal(getListingBodyType({ equipmentType: "excavator" }), "excavator");
  assert.equal(getListingBodyType({}), undefined);
});

test("persists populated category-specific details only", () => {
  assert.deepEqual(
    getPersistedListingDetails({
      equipmentType: "excavator",
      operatingHours: "6400",
      operatingWeight: "",
    }),
    { equipmentType: "excavator", operatingHours: "6400" }
  );
});

test("renders category-specific card specs instead of car defaults", () => {
  assert.deepEqual(
    getListingCardSpecs({
      category: "plant_construction",
      metadata: {
        details: {
          operatingHours: "6400",
          operatingWeight: "22000",
          operationalStatus: "working",
        },
      },
      mileage: "N/A",
      fuelType: "N/A",
      transmission: "N/A",
    }),
    [
      { kind: "operating_hours", label: "Operating hours", value: "6400 hrs" },
      { kind: "weight", label: "Operating weight", value: "22000 kg" },
      { kind: "status", label: "Operational status", value: "Working" },
    ]
  );

  assert.deepEqual(
    getListingCardSpecs({
      category: "motorbike",
      metadata: {
        details: { fuelSystem: "fuel_injection", engineCapacity: "1300" },
      },
      mileage: "5,000 kms",
      fuelType: "N/A",
      transmission: "N/A",
    }),
    [
      { kind: "fuel", label: "Fuel system", value: "Fuel Injection" },
      { kind: "engine_capacity", label: "Engine capacity", value: "1300 cc" },
      { kind: "mileage", label: "Mileage", value: "5,000 kms" },
    ]
  );
});

test("uses category-specific filter fields and subtype options", () => {
  const plantFilters = getCategoryFilterConfig("plant_construction");
  assert.equal(plantFilters.bodyTypeLabel, "Equipment Type");
  assert.equal(plantFilters.showMileage, false);
  assert.equal(plantFilters.showTransmission, false);
  assert.deepEqual(
    plantFilters.bodyTypes.map((option) => option.value),
    ["excavator", "bulldozer", "crane", "loader"]
  );

  const bikeFilters = getCategoryFilterConfig("motorbike");
  assert.equal(bikeFilters.bodyTypeLabel, "Bike Type");
  assert.equal(bikeFilters.showMileage, true);
  assert.equal(bikeFilters.showTransmission, false);
});

test("preserves the shared Farm document hierarchy", () => {
  assert.equal(FARM_CATEGORY_OPTIONS.length, 14);
  assert.deepEqual(
    getFarmSubcategoryOptions("tractors").map((option) => option.label),
    [
      "Any",
      "Compact Tractor",
      "Large Tractor",
      "Medium Tractor",
      "Other Tractors",
      "Small Tractor",
      "Tractor Attachments",
    ]
  );

  const farmFilters = getCategoryFilterConfig("farm_agricultural");
  assert.equal(farmFilters.bodyTypeGroups?.[0].label, "4WD Vehicles");
  assert.equal(farmFilters.bodyTypeGroups?.at(-1)?.label, "Trailers");
});

test("renders both Farm category levels on listing cards", () => {
  assert.equal(
    getListingDisplayType({
      category: "farm_agricultural",
      bodyType: "compact_tractor",
      metadata: {
        details: {
          farmCategory: "tractors",
          equipmentType: "compact_tractor",
        },
      },
    }),
    "Tractors · Compact Tractor"
  );
});
