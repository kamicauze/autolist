import assert from "node:assert/strict";
import {
  hasTruckSearchFilters,
  listingMatchesTruckSearchFilters,
  type TruckSearchFilters,
} from "./truck-search-filters";

const listing = {
  metadata: {
    axleConfig: "6x4",
    cabType: "Sleeper Cab",
    gvmKg: "26,000 kg",
    enginePowerBhp: 420,
  },
};

const matchingFilters: TruckSearchFilters = {
  axleConfig: "6X4",
  cabType: " sleeper   cab ",
  minGvmKg: 18000,
  maxGvmKg: 30000,
  minEnginePowerBhp: 400,
  maxEnginePowerBhp: 450,
};

assert.equal(hasTruckSearchFilters({}), false);
assert.equal(hasTruckSearchFilters(matchingFilters), true);
assert.equal(listingMatchesTruckSearchFilters(listing, matchingFilters), true);
assert.equal(
  listingMatchesTruckSearchFilters(listing, {
    ...matchingFilters,
    axleConfig: "8x4",
  }),
  false
);
assert.equal(
  listingMatchesTruckSearchFilters(listing, {
    minGvmKg: 27000,
  }),
  false
);
assert.equal(
  listingMatchesTruckSearchFilters(listing, {
    maxEnginePowerBhp: 419,
  }),
  false
);
assert.equal(
  listingMatchesTruckSearchFilters({ metadata: { axleConfig: "6x4" } }, { minGvmKg: 1 }),
  false
);

assert.equal(
  listingMatchesTruckSearchFilters(
    {
      metadata: {
        details: {
          axleConfig: "4x2",
          cabType: "Day Cab",
          gvmKg: "7,500",
          enginePowerBhp: "180 BHP",
        },
      },
    },
    {
      axleConfig: "4x2",
      cabType: "Day Cab",
      maxGvmKg: 7500,
      minEnginePowerBhp: 180,
    }
  ),
  true
);
