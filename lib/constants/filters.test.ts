import assert from "node:assert/strict";
import {
  KENYA_COUNTIES,
  LOCATIONS,
  OLDER_THAN_1990_YEAR_OPTION,
  YEARS,
  locationMatchesFilter,
} from "./filters";
import { LANDING_YEAR_OPTIONS } from "./landing-search";
import { KENYA_CITIES } from "./marketplace";

assert.equal(YEARS[0], new Date().getFullYear());
assert.equal(YEARS.at(-1), 1990);
assert.equal(YEARS.includes(1989), false);
assert.deepEqual(OLDER_THAN_1990_YEAR_OPTION, { label: "<1990", value: "1989" });
assert.deepEqual(LANDING_YEAR_OPTIONS.at(-1), { label: "1990", value: "1990" });

assert.equal(KENYA_COUNTIES.length, 47);
assert.deepEqual(LOCATIONS.slice(0, 6), [
  "All Locations",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
]);
assert.equal(new Set(LOCATIONS).size, LOCATIONS.length);
for (const county of KENYA_COUNTIES) {
  assert.ok(LOCATIONS.includes(county), `${county} is missing from the location filter`);
}
for (const city of KENYA_CITIES) {
  assert.ok(
    KENYA_COUNTIES.some((county) => locationMatchesFilter(city, county)),
    `${city} cannot be found through its county filter`
  );
}
assert.equal(locationMatchesFilter("Eldoret", "Uasin Gishu"), true);
assert.equal(locationMatchesFilter("Eldoret", "Nairobi"), false);
assert.equal(locationMatchesFilter("Thika", "Kiambu"), true);
assert.equal(locationMatchesFilter("Kiambu", "Thika"), false);
