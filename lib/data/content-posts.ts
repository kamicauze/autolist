import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type {
  AdminContentPostsData,
  ContentPost,
  ContentPostRecord,
} from "@/lib/types/content-posts";

export const CONTENT_POST_SELECT = [
  "id",
  "title",
  "slug",
  "excerpt",
  "body",
  "status",
  "cover_image_url",
  "published_at",
  "author",
  "created_by",
  "created_at",
  "updated_at",
].join(", ");

const EMPTY_ADMIN_CONTENT_POSTS_DATA: AdminContentPostsData = {
  schemaReady: false,
  stats: {
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    publishedThisMonth: 0,
  },
  posts: [],
};

export function normalizeContentPost(record: ContentPostRecord): ContentPost {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    body: record.body,
    status: record.status,
    coverImageUrl: record.cover_image_url,
    publishedAt: record.published_at,
    author: record.author,
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function calculateAdminContentPostStats(
  posts: Pick<ContentPost, "status" | "publishedAt">[]
): AdminContentPostsData["stats"] {
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  return {
    totalPosts: posts.length,
    draftPosts: posts.filter((post) => post.status === "draft").length,
    publishedPosts: posts.filter((post) => post.status === "published").length,
    publishedThisMonth: posts.filter(
      (post) =>
        post.status === "published" &&
        Boolean(post.publishedAt) &&
        post.publishedAt?.slice(0, 7) === currentMonthKey
    ).length,
  };
}

function toContentPostRows(data: unknown): ContentPostRecord[] {
  return (data ?? []) as unknown as ContentPostRecord[];
}

export async function getAdminContentPostsData(): Promise<AdminContentPostsData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_posts")
    .select(CONTENT_POST_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error)) {
      return EMPTY_ADMIN_CONTENT_POSTS_DATA;
    }

    console.error("Error fetching admin content posts:", error);
    return EMPTY_ADMIN_CONTENT_POSTS_DATA;
  }

  const posts = toContentPostRows(data).map(normalizeContentPost);

  return {
    schemaReady: true,
    stats: calculateAdminContentPostStats(posts),
    posts,
  };
}

export async function getPublishedContentPosts(limit = 24): Promise<ContentPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_posts")
    .select(CONTENT_POST_SELECT)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingRelationError(error)) {
      return [];
    }

    console.error("Error fetching published content posts:", error);
    return [];
  }

  return toContentPostRows(data).map(normalizeContentPost);
}

export async function getPublishedContentPostBySlug(slug: string): Promise<ContentPost | null> {
  if (!slug) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_posts")
    .select(CONTENT_POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    console.error("Error fetching content post by slug:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeContentPost(data as unknown as ContentPostRecord);
}
