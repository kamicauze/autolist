export const CONTENT_POST_STATUSES = ["draft", "published"] as const;
export const CONTENT_POST_CATEGORIES = ["blog", "review", "news", "advice", "faq"] as const;
export const CONTENT_POST_SUBCATEGORIES = [
  "expert_reviews",
  "video_reviews",
  "test_drive",
  "comparison",
  "advice",
  "news",
  "car_launch",
  "opinion",
] as const;

export type ContentPostStatus = (typeof CONTENT_POST_STATUSES)[number];
export type ContentPostCategory = (typeof CONTENT_POST_CATEGORIES)[number];
export type ContentPostSubcategory = (typeof CONTENT_POST_SUBCATEGORIES)[number];
export type LegacyContentPostCategory = "news_advice";
export type StoredContentPostCategory = ContentPostCategory | LegacyContentPostCategory;

export type ContentPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ContentPostStatus;
  category?: StoredContentPostCategory;
  subcategory?: ContentPostSubcategory | null;
  cover_image_url: string | null;
  gallery_image_urls?: string[] | null;
  published_at: string | null;
  author: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ContentPostStatus;
  category: ContentPostCategory;
  subcategory: ContentPostSubcategory | null;
  coverImageUrl: string | null;
  galleryImageUrls: string[];
  publishedAt: string | null;
  author: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminContentPostsData = {
  schemaReady: boolean;
  stats: {
    totalPosts: number;
    draftPosts: number;
    publishedPosts: number;
    publishedThisMonth: number;
  };
  posts: ContentPost[];
};

export type UpdateContentPostInput = {
  postId: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: ContentPostCategory;
  subcategory: ContentPostSubcategory | null;
  coverImageUrl: string;
  galleryImageUrls: string[];
  author: string;
};

export type ContentPostMutationResult =
  | {
      success: true;
      post: ContentPost;
    }
  | {
      error: string;
    };

export type ContentPostDocumentImportResult =
  | {
      success: true;
      body: string;
      fileName: string;
      warnings: string[];
    }
  | {
      success: false;
      error: string;
    };
