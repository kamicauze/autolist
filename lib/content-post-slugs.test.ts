import assert from "node:assert/strict";
import test from "node:test";
import { getLegacyContentPostSlug, getPublicContentPostSlug } from "./content-post-slugs";

test("legacy blog links redirect to readable slugs that resolve the stored post", () => {
  for (const slug of ["untitled-post", "untitled-post-2", "buying-brand-new-2"]) {
    const publicSlug = getPublicContentPostSlug(slug);
    assert.notEqual(publicSlug, slug);
    assert.equal(getPublicContentPostSlug(publicSlug), publicSlug);
    assert.equal(getLegacyContentPostSlug(publicSlug), slug);
  }
  assert.equal(getPublicContentPostSlug("other-article"), "other-article");
  assert.equal(getLegacyContentPostSlug("other-article"), "other-article");
});
