import assert from "node:assert/strict";
import test from "node:test";
import { buildListingCardFacts } from "./listing-card-facts";

test("listing cards pair their four primary facts with semantic illustrations", () => {
  assert.deepEqual(
    buildListingCardFacts({
      fuelType: "Petrol",
      engineSize: "1200 cc",
      bodyType: "Hatchback",
      transmission: "Automatic",
      mileage: "115,800 km",
    }),
    [
      { key: "fuel", value: "Petrol" },
      { key: "engine-size", value: "1200 cc" },
      { key: "transmission", value: "Automatic" },
      { key: "mileage", value: "115,800 km" },
    ]
  );
});

test("listing cards fall back to body type when engine size is unavailable", () => {
  assert.deepEqual(
    buildListingCardFacts({
      bodyType: "Hatchback",
      transmission: "Manual",
    }),
    [
      { key: "body-type", value: "Hatchback" },
      { key: "transmission", value: "Manual" },
    ]
  );
});

test("listing cards show one cc unit for numeric and previously suffixed capacities", () => {
  for (const [input, expected] of [
    ["1800", "1800 cc"],
    ["1500CC", "1500 cc"],
    [" 1,500 cc ", "1,500 cc"],
    ["1.5 L", "1.5 L"],
    ["Electric", "Electric"],
  ]) {
    assert.deepEqual(buildListingCardFacts({ engineSize: input }), [
      { key: "engine-size", value: expected },
    ]);
  }
});
