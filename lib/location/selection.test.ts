import assert from "node:assert/strict";
import { test } from "node:test";
import { inferCounty, selectCounty, selectionFromLocation, townOptions } from "./selection";
import { listingSchema } from "../validations/listing";

test("town-first choices identify county and disambiguate duplicate names", () => {
  const options = townOptions("");
  assert.deepEqual(JSON.parse(options.find((option) => option.label === "Thika (Kiambu)")!.value), ["Kiambu", "Thika"]);
  assert.equal(inferCounty(" thika "), "Kiambu");
  assert.equal(inferCounty("Keroka"), "");
  assert.equal(inferCounty("Unlisted Town"), "");
  assert.equal(options.filter((option) => option.label.startsWith("Keroka (")).length, 2);
  assert.deepEqual(townOptions("Kiambu").map((option) => JSON.parse(option.value)[0]), Array(townOptions("Kiambu").length).fill("Kiambu"));
});

test("county changes clear incompatible towns and retain compatible selections", () => {
  assert.deepEqual(selectCounty({ county: "Kiambu", town: "Thika" }, "Nakuru"), { county: "Nakuru", town: "" });
  assert.deepEqual(selectCounty({ county: "Kiambu", town: "Custom Town" }, "Kiambu"), { county: "Kiambu", town: "Custom Town" });
  assert.deepEqual(selectCounty({ county: "Kiambu", town: "Thika" }, ""), { county: "", town: "" });
  assert.deepEqual(selectionFromLocation("Thika"), { county: "Kiambu", town: "Thika" });
  assert.deepEqual(selectionFromLocation("Kiambu"), { county: "Kiambu", town: "" });
  assert.deepEqual(selectionFromLocation("Old Custom Town"), { county: "", town: "Old Custom Town" });
});

test("listing validation normalizes typed locations and retains county in save data", () => {
  const data = listingSchema.parse({
    make: "Toyota", model: "Corolla", year: 2020, price: 1000000,
    description: "A well maintained vehicle for sale.", features: ["Air Conditioning"], condition: "locally_used",
    country: "Kenya", county: "Kiambu", cityTown: "  custom   town ", locationArea: "  plot 12B   near ABC HQ ",
  });
  assert.equal(data.county, "Kiambu");
  assert.equal(data.cityTown, "Custom Town");
  assert.equal(data.locationArea, "Plot 12B Near ABC HQ");
  assert.equal(listingSchema.shape.cityTown.parse("Kampala"), "Kampala");
});
