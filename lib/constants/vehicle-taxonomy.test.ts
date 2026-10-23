import assert from "node:assert/strict";
import test from "node:test";
import { FARM_MAKES, FARM_TAXONOMY, HOURS_USED_STEPS, MAKES_BY_CATEGORY, getSubcategoriesForTaxonomyCategory } from "./vehicle-taxonomy";

test("farm manufacturer catalog adds the full supplied list and retains existing choices", () => {
  assert.equal(FARM_MAKES.length, 486);
  assert.equal(new Set(FARM_MAKES.map((make) => make.toLowerCase())).size, FARM_MAKES.length);
  for (const manufacturer of ["Accord", "Agra-GPS", "Case IH", "New Front", "New Holland", "Unknown", "Unkown", "Yamaha", "ZVVZ", "Chillington", "Merrick Loggin Trailers", "Richard Western Rolland"]) {
    assert.ok(FARM_MAKES.includes(manufacturer), `Missing manufacturer ${manufacturer}`);
  }
  assert.equal(MAKES_BY_CATEGORY.farm_agricultural, FARM_MAKES);
});

test("farm taxonomy includes all fifteen supplied categories and retains existing ATV records", () => {
  assert.equal(FARM_TAXONOMY.length, 15);
  assert.deepEqual(getSubcategoriesForTaxonomyCategory("farm_agricultural", "ATVS"), ["ATV Trailers"]);
  assert.deepEqual(getSubcategoriesForTaxonomyCategory("farm_agricultural", "4WD Vehicles"), ["ATVs"]);
  assert.ok(getSubcategoriesForTaxonomyCategory("farm_agricultural", "Harvesters").includes("Follage Harvesters"));
  assert.ok(getSubcategoriesForTaxonomyCategory("farm_agricultural", "Tractors").includes("Medium Tractor"));
  assert.deepEqual(HOURS_USED_STEPS, [0, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]);
});
