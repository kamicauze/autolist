"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { CONTENT_POST_SELECT, normalizeContentPost } from "@/lib/data/content-posts";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type {
  ContentPost,
  ContentPostMutationResult,
  ContentPostRecord,
  ContentPostStatus,
  UpdateContentPostInput,
} from "@/lib/types/content-posts";

const updateContentPostSchema = z.object({
  postId: z.string().uuid("Unknown post."),
  title: z.string().trim().min(2, "Title is required.").max(160, "Title is too long."),
  slug: z.string().trim().max(160, "Slug is too long."),
  excerpt: z.string().trim().max(400, "Excerpt is too long."),
  body: z.string().trim().max(40000, "Body is too long."),
  coverImageUrl: z.string().trim().max(2000, "Cover image URL is too long."),
  author: z.string().trim().min(2, "Author is required.").max(120, "Author is too long."),
});

const contentPostIdSchema = z.object({
  postId: z.string().uuid("Unknown post."),
});

type ContentPostMetaRow = Pick<ContentPostRecord, "id" | "slug" | "status">;

function normalizeBody(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function normalizeOptionalCoverImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid-protocol");
    }

    return trimmed;
  } catch {
    throw new Error("Cover image URL must be a valid http or https URL.");
  }
}

function normalizeStoredCoverImageUrl(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function slugifyContentPostValue(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `post-${randomUUID().slice(0, 8)}`;
}

async function resolveUniqueSlug(
  supabase: Awaited<ReturnType<typeof requireAdminAction>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never,
  value: string,
  postId?: string
) {
  const baseSlug = slugifyContentPostValue(value);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("content_posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle<{ id: string }>();

    if (error && !isMissingRelationError(error)) {
      throw new Error(error.message || "Unable to validate post slug.");
    }

    if (!data || data.id === postId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getDefaultAuthor(
  supabase: Awaited<ReturnType<typeof requireAdminAction>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never,
  userId: string,
  fallbackEmail: string | null
) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle<{ full_name: string | null }>();

  const fullName = data?.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  if (fallbackEmail) {
    return fallbackEmail.split("@")[0];
  }

  return "Autolist Editorial";
}

async function getContentPostMeta(
  supabase: Awaited<ReturnType<typeof requireAdminAction>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never,
  postId: string
) {
  const { data, error } = await supabase
    .from("content_posts")
    .select("id, slug, status")
    .eq("id", postId)
    .maybeSingle<ContentPostMetaRow>();

  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error("Content posts storage is not ready yet. Run the content_posts migration first.");
    }

    throw new Error(error.message || "Unable to load the selected post.");
  }

  if (!data) {
    throw new Error("Post not found.");
  }

  return data;
}

async function getContentPostRecord(
  supabase: Awaited<ReturnType<typeof requireAdminAction>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never,
  postId: string
) {
  const { data, error } = await supabase
    .from("content_posts")
    .select(CONTENT_POST_SELECT)
    .eq("id", postId)
    .maybeSingle<ContentPostRecord>();

  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error("Content posts storage is not ready yet. Run the content_posts migration first.");
    }

    throw new Error(error.message || "Unable to load the selected post.");
  }

  if (!data) {
    throw new Error("Post not found.");
  }

  return data;
}

function revalidateContentPostPaths(post: Pick<ContentPost, "slug">, previousSlug?: string | null) {
  revalidatePath("/admin/blogs-content");
  revalidatePath("/blog");

  if (previousSlug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  revalidatePath(`/blog/${post.slug}`);
}

function toMutationError(error: unknown): ContentPostMutationResult {
  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong while updating the post." };
}

export async function createContentPostDraft(): Promise<ContentPostMutationResult> {
  try {
    const context = await requireAdminAction();

    if ("error" in context) {
      return { error: context.error };
    }

    const title = "Untitled post";
    const author = await getDefaultAuthor(context.supabase, context.user.id, context.user.email ?? null);
    const slug = await resolveUniqueSlug(context.supabase, title);

    const { data, error } = await context.supabase
      .from("content_posts")
      .insert({
        title,
        slug,
        excerpt: "",
        body: "",
        status: "draft" as const,
        cover_image_url: null,
        published_at: null,
        author,
        created_by: context.user.id,
      })
      .select(CONTENT_POST_SELECT)
      .single<ContentPostRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          error: "Content posts storage is not ready yet. Run the content_posts migration first.",
        };
      }

      if (error.code === "23505") {
        return { error: "A post with this slug already exists. Try again." };
      }

      return { error: error.message || "Unable to create a new draft." };
    }

    const post = normalizeContentPost(data);
    revalidateContentPostPaths(post);

    return {
      success: true,
      post,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function updateContentPost(
  input: UpdateContentPostInput
): Promise<ContentPostMutationResult> {
  try {
    const parsed = updateContentPostSchema.safeParse(input);

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid post update." };
    }

    const context = await requireAdminAction();

    if ("error" in context) {
      return { error: context.error };
    }

    const existingPost = await getContentPostMeta(context.supabase, parsed.data.postId);
    const slug = await resolveUniqueSlug(
      context.supabase,
      parsed.data.slug || parsed.data.title,
      parsed.data.postId
    );
    const coverImageUrl = normalizeOptionalCoverImageUrl(parsed.data.coverImageUrl);

    const { data, error } = await context.supabase
      .from("content_posts")
      .update({
        title: parsed.data.title.trim(),
        slug,
        excerpt: parsed.data.excerpt.trim(),
        body: normalizeBody(parsed.data.body),
        cover_image_url: coverImageUrl,
        author: parsed.data.author.trim(),
      })
      .eq("id", parsed.data.postId)
      .select(CONTENT_POST_SELECT)
      .single<ContentPostRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          error: "Content posts storage is not ready yet. Run the content_posts migration first.",
        };
      }

      if (error.code === "23505") {
        return { error: "That slug is already in use by another post." };
      }

      return { error: error.message || "Unable to save the post." };
    }

    const post = normalizeContentPost(data);
    revalidateContentPostPaths(post, existingPost.slug);

    return {
      success: true,
      post,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

function validateReadyToPublish(post: ContentPostRecord) {
  if (!post.title.trim()) {
    return "Add a title before publishing.";
  }

  if (!post.author.trim()) {
    return "Add an author before publishing.";
  }

  if (!post.excerpt.trim()) {
    return "Add an excerpt before publishing.";
  }

  if (!normalizeBody(post.body)) {
    return "Add body copy before publishing.";
  }

  return null;
}

async function updateContentPostStatus(
  postId: string,
  status: ContentPostStatus
): Promise<ContentPostMutationResult> {
  const parsed = contentPostIdSchema.safeParse({ postId });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Unknown post." };
  }

  try {
    const context = await requireAdminAction();

    if ("error" in context) {
      return { error: context.error };
    }

    const existingPost = await getContentPostRecord(context.supabase, parsed.data.postId);

    if (status === "published") {
      const validationError = validateReadyToPublish(existingPost);

      if (validationError) {
        return { error: validationError };
      }
    }

    const slug = await resolveUniqueSlug(
      context.supabase,
      existingPost.slug || existingPost.title,
      existingPost.id
    );
    const nextPublishedAt = status === "published" ? new Date().toISOString() : null;

    const { data, error } = await context.supabase
      .from("content_posts")
      .update({
        title: existingPost.title.trim(),
        slug,
        excerpt: existingPost.excerpt.trim(),
        body: normalizeBody(existingPost.body),
        cover_image_url: normalizeStoredCoverImageUrl(existingPost.cover_image_url),
        author: existingPost.author.trim(),
        status,
        published_at: nextPublishedAt,
      })
      .eq("id", existingPost.id)
      .select(CONTENT_POST_SELECT)
      .single<ContentPostRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          error: "Content posts storage is not ready yet. Run the content_posts migration first.",
        };
      }

      if (error.code === "23505") {
        return { error: "That slug is already in use by another post." };
      }

      return {
        error:
          error.message ||
          (status === "published" ? "Unable to publish the post." : "Unable to move the post back to draft."),
      };
    }

    const post = normalizeContentPost(data);
    revalidateContentPostPaths(post, existingPost.slug);

    return {
      success: true,
      post,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function publishContentPost(postId: string) {
  return updateContentPostStatus(postId, "published");
}

export async function unpublishContentPost(postId: string) {
  return updateContentPostStatus(postId, "draft");
}
