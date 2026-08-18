import assert from "node:assert/strict";
import test from "node:test";
import { LISTING_ALERT_CATEGORY_CONFIG } from "./listing-alerts";
import { LISTING_CATEGORY_OPTIONS } from "./marketplace";

test("listing alerts support every canonical marketplace category", () => {
  assert.deepEqual(
    Object.keys(LISTING_ALERT_CATEGORY_CONFIG).sort(),
    LISTING_CATEGORY_OPTIONS.map(({ value }) => value).sort()
  );
});

test("listing alerts use category-appropriate preference labels", () => {
  assert.deepEqual(
    LISTING_ALERT_CATEGORY_CONFIG.car.fields.map(({ label }) => label),
    ["Body style", "Fuel type"]
  );
  assert.equal(LISTING_ALERT_CATEGORY_CONFIG.van.fields[0].label, "Van type");
  assert.equal(LISTING_ALERT_CATEGORY_CONFIG.motorbike.fields[0].label, "Bike type");
  assert.equal(LISTING_ALERT_CATEGORY_CONFIG.truck.fields[0].label, "Truck type");
  assert.ok(
    LISTING_ALERT_CATEGORY_CONFIG.truck.fields[0].options.some(
      ({ value }) => value === "Trailers"
    )
  );
  assert.equal(
    LISTING_ALERT_CATEGORY_CONFIG.plant_construction.brandLabel,
    "Manufacturer"
  );
  assert.equal(
    LISTING_ALERT_CATEGORY_CONFIG.farm_agricultural.fields[0].label,
    "Equipment type"
  );
  assert.equal(
    LISTING_ALERT_CATEGORY_CONFIG.plant_construction.fields[1].label,
    "Usage hours"
  );
});
