import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server";
import type { ListingFilters } from "@/lib/types/listing";

let filters: ListingFilters | undefined;
mock.module("@/lib/ai/provider", { namedExports: {
  getAiProviderConfig: () => ({ enabled: false }),
  generateAiJson: () => { throw new Error("Search rules must not call an AI provider in this test."); },
} });
mock.module("@/lib/data/listings", { namedExports: {
  searchListings: async (input: { filters: ListingFilters }) => {
    filters = input.filters;
    return { listings: [], total: 0, totalPages: 0 };
  },
} });
const { POST } = await import("./route");

async function search(query: string, currentParams = {}) {
  const response = await POST(new NextRequest("https://autolist.co.ke/api/ai/smart-search", {
    method: "POST", body: JSON.stringify({ query, currentParams }),
  }));
  assert.equal(response.status, 200);
  return response.json();
}

test("quick search uses the same budget range in previews and the results URL", async () => {
  const result = await search("Toyota between 2m and 3m");
  assert.equal(filters?.make, "Toyota");
  assert.equal(filters?.model, undefined);
  assert.equal(filters?.minPrice, 2_000_000);
  assert.equal(filters?.maxPrice, 3_000_000);
  const url = new URL(result.searchUrl, "https://autolist.co.ke");
  assert.equal(url.searchParams.get("minPrice"), "2000000");
  assert.equal(url.searchParams.get("maxPrice"), "3000000");
  assert.equal(url.searchParams.has("model"), false);
});

test("assistant refinements, URL priming, filter removal and reset retain the intended scope", async () => {
  const initial = { make: "Toyota", maxPrice: "3000000", location: "Nairobi" };
  const refined = await search("automatic", initial);
  assert.deepEqual(refined.params, { ...initial, transmission: "Automatic" });
  assert.deepEqual((await search("", refined.params)).params, refined.params);
  assert.deepEqual((await search("remove budget", refined.params)).params, {
    make: "Toyota", location: "Nairobi", transmission: "Automatic",
  });
  const reset = await search("reset", refined.params);
  assert.deepEqual(reset.params, {});
  assert.equal(reset.searchUrl, "/search");
  assert.ok(Object.values(filters || {}).every((value) => value === undefined));
});

test("optional family refinements do not block viewing already-matched results", async () => {
  const result = await search("family SUV under 3m");
  assert.equal(result.clarification, null);
  assert.ok(result.refinement?.options.length);
  assert.equal(result.params.bodyType, "SUV");
  assert.equal(result.params.maxPrice, "3000000");
});

test("near-me search still asks for a location before claiming local matches", async () => {
  const result = await search("BMW near me under 5m");
  assert.equal(result.clarification?.question, "Which area should I use?");
  assert.equal(result.refinement, null);
});
