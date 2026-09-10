import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./admin-ads-banners-live.tsx", import.meta.url), "utf8");

test("banner editor exposes visual placement and category targeting controls", () => {
  assert.match(source, /PLACEMENT_PREVIEW_DETAILS/);
  assert.match(source, /PlacementMiniMap/);
  assert.match(source, /Choose the page area where this banner will appear/);
  assert.match(source, /Category targeting/);
  assert.match(source, /CMS_BANNER_CATEGORY_TARGETS\.map/);
  assert.match(source, /All categories/);
  assert.match(source, /Preview placement/);
  assert.match(source, /BannerPlacementPreviewDialog/);
  assert.match(source, /Preview does not publish or save changes/);
  assert.match(source, /Visitors will not see this until the banner is saved, active, and within its schedule/);
  assert.doesNotMatch(source, /<select[\s\S]*Placement[\s\S]*CMS_BANNER_PLACEMENTS\.map/);
});
