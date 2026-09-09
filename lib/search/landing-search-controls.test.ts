import assert from "node:assert/strict";
import {
  getLandingSearchButtonLabel,
  reconcileLandingRange,
} from "./landing-search-controls";

assert.equal(
  getLandingSearchButtonLabel({ category: "car", count: 152, status: "ready" }),
  "Search 152 cars",
);
assert.equal(
  getLandingSearchButtonLabel({
    category: "motorbike",
    count: 1,
    status: "ready",
  }),
  "Search 1 bike",
);
assert.equal(
  getLandingSearchButtonLabel({ category: "truck", count: 4, status: "ready" }),
  "Search 4 trucks",
);
assert.equal(
  getLandingSearchButtonLabel({
    category: "plant_construction",
    count: 0,
    status: "ready",
  }),
  "Search 0 plant machines",
);
assert.equal(
  getLandingSearchButtonLabel({
    category: "farm_agricultural",
    count: 9,
    status: "ready",
  }),
  "Search 9 farm machines",
);

assert.equal(
  getLandingSearchButtonLabel({
    category: "car",
    count: 81,
    status: "loading",
  }),
  "Checking cars…",
);
assert.equal(
  getLandingSearchButtonLabel({ category: "car", count: 81, status: "error" }),
  "Search cars",
);

assert.deepEqual(
  reconcileLandingRange({
    side: "from",
    nextValue: "50000",
    currentFrom: "any",
    currentTo: "any",
  }),
  { from: "50000", to: "any" },
);
assert.deepEqual(
  reconcileLandingRange({
    side: "to",
    nextValue: "100000",
    currentFrom: "any",
    currentTo: "any",
  }),
  { from: "any", to: "100000" },
);
assert.deepEqual(
  reconcileLandingRange({
    side: "from",
    nextValue: "100000",
    currentFrom: "any",
    currentTo: "50000",
  }),
  { from: "100000", to: "100000" },
);
assert.deepEqual(
  reconcileLandingRange({
    side: "to",
    nextValue: "30000",
    currentFrom: "100000",
    currentTo: "any",
  }),
  { from: "30000", to: "30000" },
);
