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
