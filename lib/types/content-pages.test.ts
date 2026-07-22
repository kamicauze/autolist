import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTENT_PAGE_DEFINITIONS,
  CONTENT_PAGE_SLUGS,
} from "./content-pages";

test("public policy pages are managed by the CMS at fixed routes", () => {
  assert.deepEqual(
    CONTENT_PAGE_SLUGS.filter((slug) =>
      ["privacy", "terms", "acceptable-use", "cookies"].includes(slug)
    ),
    ["privacy", "terms", "acceptable-use", "cookies"]
  );

  assert.equal(CONTENT_PAGE_DEFINITIONS.privacy.path, "/privacy");
  assert.equal(CONTENT_PAGE_DEFINITIONS.terms.path, "/terms");
  assert.equal(CONTENT_PAGE_DEFINITIONS["acceptable-use"].path, "/acceptable-use");
  assert.equal(CONTENT_PAGE_DEFINITIONS.cookies.path, "/cookies");
});
