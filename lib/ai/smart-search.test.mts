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

test("AI echoes of structured constraints do not hide family search results", async () => {
  extracted = { q: "family SUV under 3m", useCase: "family", bodyType: "SUV", maxPrice: "3000000" };
  const result = await evaluateSmartSearch("family SUV under 3m");
  assert.equal(result.params.q, undefined);
  assert.equal(result.params.bodyType, "SUV");
  assert.equal(result.params.maxPrice, "3000000");
});

test("cleaning an echoed sentence retains the unstructured model keyword", async () => {
  extracted = { q: "Corolla automatic under 2m", maxPrice: "2000000", transmission: "Automatic" };
  const result = await evaluateSmartSearch("Corolla automatic under 2m");
  assert.equal(result.params.q, "Corolla");
});

test("generic origin searches retain the existing broad catalog behavior", async () => {
  extracted = { q: "European cars under 3m", origin: "European", maxPrice: "3000000" };
  const result = await evaluateSmartSearch("European cars under 3m");
  assert.equal(result.params.q, undefined);
  assert.equal(result.params.origin, "European");
});
