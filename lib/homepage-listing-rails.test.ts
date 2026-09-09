import assert from "node:assert/strict";
import test from "node:test";
import { getHomepageListingRailViewAllHref } from "./homepage-listing-rails";

test("homepage listing rail view-all links stay scoped to the active rail", () => {
  assert.equal(getHomepageListingRailViewAllHref("featured", false), "/search?featured=true");
  assert.equal(getHomepageListingRailViewAllHref("viewed", false), "/recently-viewed");
  assert.equal(getHomepageListingRailViewAllHref("recent", false), "/search?sortBy=newest");
  assert.equal(
    getHomepageListingRailViewAllHref("favorites", false),
    "/login?next=%2Fdashboard%2Ffavorites"
  );
  assert.equal(getHomepageListingRailViewAllHref("favorites", true), "/dashboard/favorites");
});
