import assert from "node:assert/strict";
import { getContentPostCategoryFilterValues } from "@/lib/content-post-categories";
import {
  getCategoryForContentPostSubcategory,
  getContentPostSection,
  getContentPostSubcategoryLabel,
} from "@/lib/content-post-subcategories";
import { CONTENT_POST_CATEGORIES, CONTENT_POST_SUBCATEGORIES } from "@/lib/types/content-posts";
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
assert.deepEqual(Array.from(CONTENT_POST_SUBCATEGORIES), [
  "expert_reviews",
  "video_reviews",
  "test_drive",
  "comparison",
  "advice",
  "news",
  "car_launch",
  "opinion",
]);

assert.equal(normalizeContentPost({ ...baseRecord, category: "news" }).category, "news");
assert.equal(normalizeContentPost({ ...baseRecord, category: "advice" }).category, "advice");
assert.equal(normalizeContentPost({ ...baseRecord, category: "news_advice" }).category, "advice");
assert.equal(
  normalizeContentPost({ ...baseRecord, category: "review", subcategory: "test_drive" }).subcategory,
  "test_drive"
);
assert.equal(normalizeContentPost({ ...baseRecord, category: "review", subcategory: "other" as never }).subcategory, null);
assert.equal(getContentPostSection("blog"), "reviews_blogs");
assert.equal(getContentPostSection("news"), "news_advice");
assert.equal(getCategoryForContentPostSubcategory("car_launch"), "news");
assert.equal(getCategoryForContentPostSubcategory("opinion"), "advice");
assert.equal(getContentPostSubcategoryLabel("expert_reviews"), "Expert reviews");
assert.deepEqual(getContentPostCategoryFilterValues("reviews_blogs"), ["blog", "review"]);
assert.deepEqual(getContentPostCategoryFilterValues("car_news_advice"), [
  "news",
  "advice",
  "news_advice",
]);
