import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { SmartSearchParams } from "@/lib/types/smart-search";

let extracted: Partial<SmartSearchParams> = {};
mock.module("./provider", { namedExports: {
  getAiProviderConfig: () => ({ enabled: true }),
  generateAiJson: async () => ({ provider: "openai", model: "search-test-model", data: extracted }),
} });
const { evaluateSmartSearch } = await import("./smart-search");

test("AI vehicle keywords survive alongside budget and transmission filters", async () => {
  extracted = { q: "Corolla", maxPrice: "2000000", transmission: "Automatic" };
  const result = await evaluateSmartSearch("Corolla automatic under 2m");
  assert.equal(result.params.q, "Corolla");
  assert.equal(result.params.maxPrice, "2000000");
  assert.equal(result.params.transmission, "Automatic");
});

test("structured AI extraction replaces the original unparsed sentence", async () => {
  extracted = { make: "Toyota", model: "Corolla" };
  const result = await evaluateSmartSearch("show me a Corolla");
  assert.equal(result.params.make, "Toyota");
  assert.equal(result.params.model, "Corolla");
  assert.equal(result.params.q, undefined);
});

test("AI refinement cannot discard rule-confirmed equipment", async () => {
  extracted = { maxPrice: "5000000" };
  const result = await evaluateSmartSearch("cars with sunroof and bluetooth under 5m");
  assert.equal(result.params.q, "Bluetooth Connectivity,Sunroof");
});
