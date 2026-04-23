export const CONTENT_POST_STATUSES = ["draft", "published"] as const;

export type ContentPostStatus = (typeof CONTENT_POST_STATUSES)[number];

export type ContentPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ContentPostStatus;
  cover_image_url: string | null;
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
  coverImageUrl: string | null;
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
  coverImageUrl: string;
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
