import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./vehicle-page-client.tsx", import.meta.url), "utf8");

test("listing details do not render generic model-information copy", () => {
  assert.equal(source.includes("getModelDescription"), false);
  assert.equal(source.includes("About ${listing.make} ${listing.model}"), false);
  assert.equal(source.includes("Across this model line"), false);
});
