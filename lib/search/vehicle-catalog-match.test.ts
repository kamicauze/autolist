import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalizeMakeModel, findCatalogCandidates, type MakeModelCatalog } from "./vehicle-catalog-match";

const catalog: MakeModelCatalog = [
  { make: "Toyota", models: ["Axio", "Fielder", "Harrier", "Land Cruiser", "Land Cruiser Prado", "Hilux"] },
  { make: "Mercedes-Benz", models: ["C-Class", "E-Class", "GLE"] },
  { make: "Mazda", models: ["CX-5", "Demio"] },
];

test("snaps spacing, hyphen and case differences to catalog spellings", () => {
  assert.deepEqual(canonicalizeMakeModel({ make: "Mercedes Benz", model: "c class" }, catalog), {
    make: "Mercedes-Benz",
    model: "C-Class",
  });
  assert.deepEqual(canonicalizeMakeModel({ make: "mazda", model: "cx5" }, catalog), { make: "Mazda", model: "CX-5" });
});

test("fixes small typos and fills the make for a unique model", () => {
  assert.deepEqual(canonicalizeMakeModel({ model: "Harier" }, catalog), { make: "Toyota", model: "Harrier" });
  assert.deepEqual(canonicalizeMakeModel({ make: "Toyta", model: "Fielda" }, catalog), {
    make: "Toyota",
    model: "Fielder",
  });
});

test("keeps short forms that already match through the substring filter", () => {
  assert.deepEqual(canonicalizeMakeModel({ make: "Toyota", model: "Prado" }, catalog), {
    make: "Toyota",
    model: "Prado",
  });
});

test("leaves unknown or ambiguous values unchanged", () => {
  assert.deepEqual(canonicalizeMakeModel({ make: "Tata", model: "Nexon" }, catalog), { make: "Tata", model: "Nexon" });
  assert.deepEqual(canonicalizeMakeModel({ make: "Toyota", model: "Axi" }, []), { make: "Toyota", model: "Axi" });
});

test("retrieves catalog candidates mentioned in the query", () => {
  const candidates = findCatalogCandidates("harier under 3m in nairobi", catalog);
  assert.equal(candidates[0], "Toyota Harrier");
  assert.ok(findCatalogCandidates("land cruiser prado", catalog).includes("Toyota Land Cruiser Prado"));
  assert.deepEqual(findCatalogCandidates("cheap family car", catalog), []);
});
