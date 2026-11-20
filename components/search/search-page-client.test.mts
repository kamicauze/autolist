import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

let params = new URLSearchParams();
mock.module("next/navigation", { namedExports: {
  useSearchParams: () => params,
  useRouter: () => ({ refresh() {} }),
} });
for (const [path, name] of [
  ["./quick-filter-bar", "QuickFilterBar"],
  ["./filter-sheet", "FilterSheet"],
  ["./search-results", "SearchResults"],
  ["@/components/home/quick-search-dialog", "QuickSearchDialog"],
  ["./search-assistant-panel", "SearchAssistantPanel"],
]) {
  mock.module(path, { namedExports: { [name]: () => null } });
}
const { SearchPageClient } = await import("./search-page-client");
function render(query: string) {
  params = new URLSearchParams(query);
  return renderToStaticMarkup(createElement(SearchPageClient, {
    result: { listings: [], total: 0, totalPages: 0 }, resultKey: query, makes: [],
  }));
}

test("featured-only search explains its scope and links back to all listings", () => {
  const html = render("featured=true&page=3");
  assert.match(html, /Featured listings only/);
  assert.match(html, /href="\/search"[^>]*>Remove featured filter/);
});

test("removing featured scope preserves other criteria and resets pagination", () => {
  const html = render("featured=true&category=car&make=Toyota&q=sunroof&page=3&sortBy=price_low");
  assert.match(html, /href="\/search\?category=car&amp;make=Toyota&amp;q=sunroof&amp;sortBy=price_low"/);
});

test("ordinary search does not show a featured-only indicator", () => {
  for (const query of ["", "featured=false", "make=Toyota"]) {
    assert.doesNotMatch(render(query), /Featured listings only|Remove featured filter/);
  }
});

test("a failed first load offers retry without claiming there are zero results", () => {
  params = new URLSearchParams();
  const html = renderToStaticMarkup(createElement(SearchPageClient, {
    result: null, resultKey: "guest:all", makes: [],
  }));
  assert.match(html, /Listings could not be loaded/);
  assert.match(html, /Try again/);
  assert.doesNotMatch(html, /Showing 0 of 0 results|No vehicles found/);
});
