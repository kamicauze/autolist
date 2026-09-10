import assert from "node:assert/strict";
import test from "node:test";
import {
  cmsBannerMatchesCategoryTarget,
  getCmsBannerCategoryTargetForListingCategory,
  normalizeCmsBannerCategoryTargets,
} from "./cms-banners";

test("banner category targeting groups cars and vans together", () => {
  assert.equal(getCmsBannerCategoryTargetForListingCategory("car"), "cars_vans");
  assert.equal(getCmsBannerCategoryTargetForListingCategory("van"), "cars_vans");
  assert.equal(getCmsBannerCategoryTargetForListingCategory("motorbike"), "motorbike");
  assert.equal(getCmsBannerCategoryTargetForListingCategory("truck"), "truck");
  assert.equal(
    getCmsBannerCategoryTargetForListingCategory("plant_construction"),
    "plant_construction"
  );
  assert.equal(
    getCmsBannerCategoryTargetForListingCategory("farm_agricultural"),
    "farm_agricultural"
  );
  assert.equal(getCmsBannerCategoryTargetForListingCategory(null), null);
});

test("empty banner category targets behave as global placements", () => {
  assert.equal(cmsBannerMatchesCategoryTarget([], null), true);
  assert.equal(cmsBannerMatchesCategoryTarget([], "motorbike"), true);
  assert.equal(cmsBannerMatchesCategoryTarget(["cars_vans"], null), false);
  assert.equal(cmsBannerMatchesCategoryTarget(["cars_vans"], "cars_vans"), true);
  assert.equal(cmsBannerMatchesCategoryTarget(["cars_vans"], "motorbike"), false);
});

test("banner category targets drop unknown values from legacy data", () => {
  assert.deepEqual(
    normalizeCmsBannerCategoryTargets(["cars_vans", "unknown", "truck", 12]),
    ["cars_vans", "truck"]
  );
});
