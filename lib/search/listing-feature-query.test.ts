import assert from "node:assert/strict";
import test from "node:test";
import { requestedListingFeatures, featureOnlyQuery, listingHasRequestedFeatures } from "./listing-feature-query";
import { parseQuickSearchRules } from "./quick-search";

test("assistant retains requested equipment alongside make and budget", () => {
  const result = parseQuickSearchRules("Toyota under 3m with sunroof and bluetooth");
  assert.equal(result.params.make, "Toyota");
  assert.equal(result.params.maxPrice, "3000000");
  assert.deepEqual(new Set(featureOnlyQuery(result.params.q)), new Set(["Sunroof", "Bluetooth Connectivity"]));
});

test("feature requests require every seller-confirmed feature", () => {
  const requested = requestedListingFeatures("sunroof and bluetooth");
  assert.equal(listingHasRequestedFeatures(["Sunroof", "Bluetooth Connectivity"], requested), true);
  assert.equal(listingHasRequestedFeatures(["Sunroof"], requested), false);
  assert.equal(listingHasRequestedFeatures(null, requested), false);
  assert.deepEqual(featureOnlyQuery("Toyota sunroof"), []);
  assert.deepEqual(requestedListingFeatures("without sunroof"), []);
});
