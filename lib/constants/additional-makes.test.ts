import assert from "node:assert/strict";
import test from "node:test";
import { ALL_MAKES, getMakeData, getModelsForMake } from "./car-data";
import { TRUCK_BODY_TYPES, TRUCK_MAKES } from "./vehicle-taxonomy";
import { getVehicleReferenceOptionsFallback } from "../data/vehicle-reference-catalog";

const requestedModels: Record<string, string[]> = {
  BAIC: ["B30", "B40", "D20", "X25", "X55"],
  Chery: ["Tiggo 4 Pro", "Tiggo 7 Pro", "Tiggo 8 Pro", "Tiggo 9", "Tiggo Cross"],
  Haval: ["H1", "H2", "H6", "H6 GT", "H6C", "H7", "H9", "Jolion", "Jolion Pro"],
  ICAUR: ["03T", "V23", "V27"],
  Lepas: ["L4", "L6"],
  Mahindra: ["Bolero", "Scorpio", "Scorpio Safari", "Scorpio-N", "XUV400 EV"],
  Maxus: ["T60", "D90", "MIFA 9"],
  Proton: ["Saga", "S70", "X50", "X70", "X90", "e.MAS 5", "e.Mas 7", "e.MAS 7 PHEV"],
  Xpeng: ["G6", "X9", "G9", "G9L", "P7", "P7L"],
  Zeekr: ["X", "7X", "009", "9X"],
};

test("October 30 supplied models are selectable without removing existing Chery models", () => {
  assert.equal(new Set(ALL_MAKES).size, ALL_MAKES.length);
  for (const [make, models] of Object.entries(requestedModels)) {
    assert.ok(ALL_MAKES.includes(make));
    for (const model of models) assert.ok(getModelsForMake(make).includes(model), `${make}: ${model}`);
  }
  assert.ok(getModelsForMake("Chery").includes("Tiggo 7"));
  assert.ok(getModelsForMake("Chery").includes("Tiggo 8"));
});

test("shared trims remain distinct from model-specific Mahindra trims", () => {
  const baic = getVehicleReferenceOptionsFallback("BAIC", "X55");
  assert.ok(baic.trimOptions.some((trim) => trim.value === "Chamion" && trim.source === "shared"));
  const bolero = getVehicleReferenceOptionsFallback("Mahindra", "Bolero");
  assert.deepEqual(bolero.trimOptions.map((trim) => trim.value), ["B4", "B6", "B8"]);
  assert.ok(bolero.trimOptions.every((trim) => trim.source === "model"));
  assert.ok(!bolero.trimOptions.some((trim) => trim.value === "S11"));
  assert.deepEqual(getMakeData("Mahindra")?.models.find((m) => m.name === "Scorpio-N")?.trims,
    ["Z2", "Z4", "Z6", "Z8S", "Z8", "Z8T", "Z8L"]);
  assert.equal(new Set(getMakeData("Maxus")?.trims).size, getMakeData("Maxus")?.trims.length);
});

test("truck additions preserve Coach and expose Bus separately", () => {
  for (const make of ["Ashok Leyland", "Tata", "Toyota", "Isuzu", "Volvo"]) assert.ok(TRUCK_MAKES.includes(make));
  assert.ok(TRUCK_BODY_TYPES.includes("Bus"));
  assert.ok(TRUCK_BODY_TYPES.includes("Coach"));
});
