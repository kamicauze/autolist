import {
  CONTENT_POST_CATEGORIES,
  type ContentPostCategory,
  type StoredContentPostCategory,
} from "@/lib/types/content-posts";

const CONTENT_POST_CATEGORY_SET = new Set<string>(CONTENT_POST_CATEGORIES);

export function isContentPostCategory(value: unknown): value is ContentPostCategory {
  return typeof value === "string" && CONTENT_POST_CATEGORY_SET.has(value);
}

export function normalizeContentPostCategory(value: unknown): ContentPostCategory {
  if (value === "news_advice") {
    return "advice";
  }

  return isContentPostCategory(value) ? value : "blog";
}

export function getContentPostCategoryFilterValues(
  value: unknown
): StoredContentPostCategory[] | null {
  if (value === "reviews_blogs") {
    return ["blog", "review"];
  }

  if (value === "car_news_advice") {
    return ["news", "advice", "news_advice"];
  }

  if (value === "news_advice" || value === "advice") {
    return ["advice", "news_advice"];
  }

  if (isContentPostCategory(value)) {
    return [value];
  }

  return null;
}
