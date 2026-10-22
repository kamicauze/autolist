import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

const calls: unknown[][] = [];
let count = 13;
mock.module("@/lib/data/content-posts", {
  namedExports: {
    getPublishedContentPosts: async (...args: unknown[]) => {
      calls.push(args);
      if (args[1] === "advice") return [];
      return Array.from({ length: count }, (_, index) => ({
        id: `article-${index}`,
        slug: `article-${index}`,
        title: `Article ${index}`,
        excerpt: "Published article teaser.",
        category: "review",
        subcategory: null,
        coverImageUrl: "/article.webp",
        publishedAt: "2026-10-22T08:00:00Z",
        author: "Autolist",
      }));
    },
  },
});
mock.module("@/components/layout/header", {
  namedExports: { Header: () => null },
});
mock.module("@/components/layout/footer", {
  namedExports: { Footer: () => null },
});
const { default: BlogPage } = await import("./page");

test("editorial landing renders real featured and latest stories without cropping", async () => {
  const html = renderToStaticMarkup(
    await BlogPage({ searchParams: Promise.resolve({}) }),
  );
  assert.deepEqual(calls.splice(0), [
    [13, undefined, undefined, 0],
    [4, "advice"],
  ]);
  assert.match(html, /Cars, reviews and advice for Kenya/);
  assert.match(html, /Featured stories/);
  assert.match(html, /Latest from Autolist/);
  assert.match(html, /object-contain/);
  assert.doesNotMatch(html, /object-cover/);
  assert.match(html, /href="\/blog\?page=2"/);
  assert.doesNotMatch(html, /href="\/blog\/article-12"/);
});

test("pagination keeps supported comparison filters and asks for the next range", async () => {
  count = 2;
  const html = renderToStaticMarkup(
    await BlogPage({
      searchParams: Promise.resolve({
        section: "reviews_blogs",
        subcategory: "comparison",
        page: "2",
      }),
    }),
  );
  assert.deepEqual(calls.splice(0), [[13, "reviews_blogs", "comparison", 12]]);
  assert.match(html, /Page 2/);
  assert.match(
    html,
    /href="\/blog\?section=reviews_blogs&amp;subcategory=comparison"/,
  );
  assert.doesNotMatch(html, /Featured stories/);
  assert.doesNotMatch(html, /Next →/);
});
