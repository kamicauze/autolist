import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const heroSource = fs.readFileSync(
  path.join(process.cwd(), "components/home/hero-search.tsx"),
  "utf8"
);
const iconSource = fs.readFileSync(
  path.join(process.cwd(), "components/home/vehicle-category-icon.tsx"),
  "utf8"
);
const headerSource = fs.readFileSync(
  path.join(process.cwd(), "components/layout/header.tsx"),
  "utf8"
);

test("homepage category selector uses one consistent labelled icon system", () => {
  assert.match(heroSource, /<VehicleCategoryIcon/);
  assert.match(heroSource, /CATEGORY_SHORT_LABELS/);
  assert.match(heroSource, /grid-cols-5/);
  assert.match(heroSource, /lg:grid-rows-5/);
  assert.match(heroSource, /lg:h-full/);
  assert.match(heroSource, /aria-pressed=\{isActive\}/);
  assert.match(heroSource, /bg-primary\/\[0\.07\]/);
  assert.match(heroSource, /focus-visible:ring-primary\/70/);
  assert.doesNotMatch(heroSource, /icon: Construction/);
});

test("Plant is represented by a purpose-drawn excavator", () => {
  const plantCase = iconSource.match(
    /case "plant_construction":([\s\S]*?)case "farm_agricultural":/
  )?.[1];

  assert.ok(plantCase, "expected a dedicated plant drawing");
  assert.match(plantCase, /<rect x="4" y="27" width="29" height="6" rx="3"/);
  assert.match(plantCase, /M30 12l9 4 4 8/);
  assert.match(plantCase, /m43 24-7 1\.5 2\.5 5\.5H45/);
});

test("desktop navigation typography is slightly larger and heavier", () => {
  assert.match(headerSource, /text-\[13px\]/);
  assert.match(headerSource, /font-semibold tracking-\[-0\.01em\]/);
  assert.match(headerSource, /focus-visible:ring-primary\/70/);
  assert.doesNotMatch(
    headerSource,
    /text-\[12px\] font-medium text-gray-700 transition-colors/
  );
});
