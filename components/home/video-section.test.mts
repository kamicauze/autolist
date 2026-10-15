import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

const calls: unknown[][] = [];
let posts = [
  { id: "latest-review", title: "Latest road test", slug: "latest-road-test", category: "review", subcategory: "test_drive", publishedAt: "2026-10-15T09:00:00Z", coverImageUrl: null, excerpt: "Latest published review." },
  { id: "older-blog", title: "Ownership notes", slug: "ownership-notes", category: "blog", subcategory: null, publishedAt: "2026-10-14T09:00:00Z", coverImageUrl: "/article-cover.webp", excerpt: "An earlier blog." },
];
mock.module("@/lib/data/content-posts", { namedExports: {
  getPublishedContentPosts: async (...args: unknown[]) => { calls.push(args); return posts; },
} });
const { VideoSection } = await import("./video-section");

test("homepage reviews use the latest published CMS posts and working blog destinations", async () => {
  const html = renderToStaticMarkup(await VideoSection());
  assert.deepEqual(calls, [[4, "reviews_blogs"]]);
  assert.ok(html.indexOf("Latest road test") < html.indexOf("Ownership notes"));
  assert.match(html, /href="\/blog\?section=reviews_blogs"/);
  assert.match(html, /href="\/blog\/latest-road-test"/);
  assert.match(html, /href="\/blog\/ownership-notes"/);
  assert.match(html, /Test drive/);
  assert.doesNotMatch(html, /href="\/reviews/);
});

test("homepage omits the section when no reviews or blogs are published", async () => {
  posts = [];
  assert.equal(await VideoSection(), null);
});
