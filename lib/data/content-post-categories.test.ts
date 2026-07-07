import assert from "node:assert/strict";
import { CONTENT_POST_CATEGORIES } from "@/lib/types/content-posts";
import { normalizeContentPost } from "./content-posts";

const baseRecord = {
  id: "post-1",
  title: "Safety update",
  slug: "safety-update",
  excerpt: "Short summary",
  body: "<p>Body copy</p>",
  status: "published" as const,
  cover_image_url: null,
  gallery_image_urls: [],
  published_at: "2026-07-07T00:00:00.000Z",
  author: "Autolist Editorial",
  created_by: null,
  created_at: "2026-07-07T00:00:00.000Z",
  updated_at: "2026-07-07T00:00:00.000Z",
};

assert.deepEqual(Array.from(CONTENT_POST_CATEGORIES), [
  "blog",
  "review",
  "news",
  "advice",
  "faq",
]);

assert.equal(normalizeContentPost({ ...baseRecord, category: "news" }).category, "news");
assert.equal(normalizeContentPost({ ...baseRecord, category: "advice" }).category, "advice");
assert.equal(normalizeContentPost({ ...baseRecord, category: "news_advice" }).category, "advice");
