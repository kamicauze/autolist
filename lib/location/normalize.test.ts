import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeLocationText } from "./normalize";
import { KENYA_COUNTIES, locationMatchesFilter } from "../constants/filters";
import { getCountyTowns, KENYA_TOWNS_BY_COUNTY } from "../constants/kenya-towns";

test("location cleanup preserves spelling, abbreviations, numbers and mixed case", () => {
  assert.equal(normalizeLocationText("  waiyaki   way\nnear ABC HQ, plot 12B  "), "Waiyaki Way Near ABC HQ, Plot 12B");
  assert.equal(normalizeLocationText("p.o. box 42, off mombasa-road"), "P.O. Box 42, Off Mombasa-Road");
  assert.equal(normalizeLocationText("murang'a  iHub  CBD"), "Murang'a iHub CBD");
  assert.equal(normalizeLocationText("  ngongg   road "), "Ngongg Road");
  assert.equal(normalizeLocationText(" \t\n"), "");
  const value = "P.O. Box 12B, Near ABC HQ";
  assert.equal(normalizeLocationText(normalizeLocationText(value)), value);
});

test("all counties have unique town suggestions with existing filter cities retained", () => {
  assert.equal(KENYA_COUNTIES.length, 47);
  assert.deepEqual(Object.keys(KENYA_TOWNS_BY_COUNTY).sort(), [...KENYA_COUNTIES].sort());
  for (const county of KENYA_COUNTIES) {
    const towns = getCountyTowns(county);
    assert.ok(towns.length > 0, county);
    assert.equal(towns.length, new Set(towns).size, county);
  }
  assert.ok(getCountyTowns("Kiambu").includes("Thika"));
  assert.ok(!getCountyTowns("Nairobi").includes("Thika"));
  assert.deepEqual(getCountyTowns(""), []);
  for (const [county, town] of [["Uasin Gishu", "Eldoret"], ["Nakuru", "Naivasha"], ["Kilifi", "Malindi"], ["Trans Nzoia", "Kitale"], ["Laikipia", "Nanyuki"], ["Taita Taveta", "Voi"]]) {
    assert.ok(getCountyTowns(county).includes(town));
    assert.ok(locationMatchesFilter(town, county));
  }
});
