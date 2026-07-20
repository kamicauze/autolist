import {
  CONTENT_POST_SUBCATEGORIES,
  type ContentPostCategory,
  type ContentPostSubcategory,
} from "@/lib/types/content-posts";

export const CONTENT_POST_SECTIONS = ["reviews_blogs", "news_advice", "faq"] as const;

export type ContentPostSection = (typeof CONTENT_POST_SECTIONS)[number];

export const CONTENT_POST_SUBCATEGORY_OPTIONS: Record<
  Exclude<ContentPostSection, "faq">,
  Array<{ value: ContentPostSubcategory; label: string }>
> = {
  reviews_blogs: [
    { value: "expert_reviews", label: "Expert reviews" },
    { value: "video_reviews", label: "Video reviews" },
    { value: "test_drive", label: "Test drive" },
    { value: "comparison", label: "Comparison" },
  ],
  news_advice: [
    { value: "advice", label: "Advice" },
    { value: "news", label: "News" },
    { value: "car_launch", label: "Car launch" },
    { value: "opinion", label: "Opinion" },
  ],
};

const CONTENT_POST_SUBCATEGORY_SET = new Set<string>(CONTENT_POST_SUBCATEGORIES);

export function isContentPostSubcategory(value: unknown): value is ContentPostSubcategory {
  return typeof value === "string" && CONTENT_POST_SUBCATEGORY_SET.has(value);
}

export function normalizeContentPostSubcategory(value: unknown): ContentPostSubcategory | null {
  return isContentPostSubcategory(value) ? value : null;
}

export function getContentPostSubcategoryLabel(value: ContentPostSubcategory | null) {
  if (!value) return null;

  return [...CONTENT_POST_SUBCATEGORY_OPTIONS.reviews_blogs, ...CONTENT_POST_SUBCATEGORY_OPTIONS.news_advice]
    .find((option) => option.value === value)?.label ?? null;
}

export function getContentPostSection(category: ContentPostCategory): ContentPostSection {
  if (category === "faq") return "faq";
  if (category === "news" || category === "advice") return "news_advice";
  return "reviews_blogs";
}

export function getCategoryForContentPostSubcategory(
  subcategory: ContentPostSubcategory
): ContentPostCategory {
  switch (subcategory) {
    case "expert_reviews":
    case "video_reviews":
    case "test_drive":
    case "comparison":
      return "review";
    case "news":
    case "car_launch":
      return "news";
    case "advice":
    case "opinion":
      return "advice";
  }
}

export function getDefaultSubcategoryForSection(
  section: Exclude<ContentPostSection, "faq">
): ContentPostSubcategory {
  return CONTENT_POST_SUBCATEGORY_OPTIONS[section][0].value;
}
