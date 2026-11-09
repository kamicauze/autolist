import assert from "node:assert/strict";
import { test } from "node:test";
import { applyListingFilters } from "./listings";

function captureOrFilters(q: string) {
  const orFilters: string[] = [];
  const query = {
    or(filter: string) {
      orFilters.push(filter);
      return this;
    },
    ilike() { return this; },
    gte() { return this; },
    lte() { return this; },
    in() { return this; },
    eq() { return this; },
    not() { return this; },
    is() { return this; },
  };
  applyListingFilters(query, { q });
  return orFilters;
}

test("keyword search keeps substring matching when full-text search is off", () => {
  delete process.env.LISTING_FULL_TEXT_SEARCH_ENABLED;
  const [filter] = captureOrFilters("white prado diesel");
  assert.match(filter, /make\.ilike\.%white prado diesel%/);
  assert.doesNotMatch(filter, /listing_search_document/);
});

test("full-text search matches all words anywhere, alongside substring matching", () => {
  process.env.LISTING_FULL_TEXT_SEARCH_ENABLED = "true";
  try {
    const [filter] = captureOrFilters('white "prado" diesel');
    assert.match(filter, /^listing_search_document\.wfts\(english\)\."white prado diesel",/);
    assert.match(filter, /model\.ilike\.%white "prado" diesel%/);
  } finally {
    delete process.env.LISTING_FULL_TEXT_SEARCH_ENABLED;
  }
});
