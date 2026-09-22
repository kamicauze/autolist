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

test("homepage category selector uses one consistent labelled image system", () => {
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

test("each homepage category has an image asset", () => {
  const categoryImages = {
    car: "car",
    motorbike: "motorbike",
    van: "van",
    truck: "truck",
    plant_construction: "plant",
    farm_agricultural: "farm",
  };

  assert.match(iconSource, /<Image/);
  for (const [category, image] of Object.entries(categoryImages)) {
    assert.match(iconSource, new RegExp(`${category}: "/category-images/${image}\\.webp"`));
    assert.ok(fs.existsSync(path.join(process.cwd(), `public/category-images/${image}.webp`)));
  }
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
