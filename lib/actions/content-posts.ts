"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { hasRichTextContent, normalizeRichTextContent } from "@/lib/content-rich-text";
import { normalizeContentPostCategory } from "@/lib/content-post-categories";
import { getCategoryForContentPostSubcategory } from "@/lib/content-post-subcategories";
import { CONTENT_POST_SELECT, normalizeContentPost } from "@/lib/data/content-posts";
import { isMissingColumnError, isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CONTENT_POST_CATEGORIES,
  CONTENT_POST_SUBCATEGORIES,
  type ContentPostCategory,
  type ContentPost,
  type ContentPostDocumentImportResult,
  type ContentPostMutationResult,
  type ContentPostRecord,
  type ContentPostStatus,
  type UpdateContentPostInput,
} from "@/lib/types/content-posts";

const updateContentPostSchema = z.object({
  postId: z.string().uuid("Unknown post."),
  title: z.string().trim().min(2, "Title is required.").max(160, "Title is too long."),
  slug: z.string().trim().max(160, "Slug is too long."),
  excerpt: z.string().trim().max(400, "Excerpt is too long."),
  body: z.string().trim().max(40000, "Body is too long."),
  category: z.enum(CONTENT_POST_CATEGORIES),
  subcategory: z.enum(CONTENT_POST_SUBCATEGORIES).nullable(),
  coverImageUrl: z.string().trim().max(2000, "Cover image URL is too long."),
  galleryImageUrls: z.array(z.string().trim().max(2000, "Gallery image URL is too long.")).max(12, "Use up to 12 gallery images."),
  author: z.string().trim().min(2, "Author is required.").max(120, "Author is too long."),
});

const contentPostIdSchema = z.object({
  postId: z.string().uuid("Unknown post."),
});

const CONTENT_DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;
const CONTENT_BODY_MAX_LENGTH = 40000;

type ContentPostMetaRow = Pick<ContentPostRecord, "id" | "slug" | "status">;

function isMissingContentPostsSchemaError(error: Parameters<typeof isMissingRelationError>[0]) {
  return isMissingRelationError(error) || isMissingColumnError(error);
}

function missingContentPostsSchemaMessage() {
  return "Content posts storage is not ready yet. Run the latest content_posts migration first.";
}

function normalizeBody(value: string) {
  return normalizeRichTextContent(value);
}

function normalizeOptionalCoverImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid-protocol");
    }

    return trimmed;
  } catch {
    throw new Error("Cover image URL must be a site path or a valid http/https URL.");
  }
}

function normalizeStoredCoverImageUrl(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeGalleryImageUrls(values: string[]) {
  return values
    .map((value) => normalizeOptionalCoverImageUrl(value))
    .filter((value): value is string => Boolean(value));
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
    if (isMissingContentPostsSchemaError(error)) {
      throw new Error(missingContentPostsSchemaMessage());
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
    if (isMissingContentPostsSchemaError(error)) {
      throw new Error(missingContentPostsSchemaMessage());
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
        category: "blog" satisfies ContentPostCategory,
        subcategory: null,
        cover_image_url: null,
        gallery_image_urls: [],
        published_at: null,
        author,
        created_by: context.user.id,
      })
      .select(CONTENT_POST_SELECT)
      .single<ContentPostRecord>();

    if (error) {
      if (isMissingContentPostsSchemaError(error)) {
        return {
          error: missingContentPostsSchemaMessage(),
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
    const galleryImageUrls = normalizeGalleryImageUrls(parsed.data.galleryImageUrls);
    const category = parsed.data.subcategory
      ? getCategoryForContentPostSubcategory(parsed.data.subcategory)
      : parsed.data.category;

    const { data, error } = await context.supabase
      .from("content_posts")
      .update({
        title: parsed.data.title.trim(),
        slug,
        excerpt: parsed.data.excerpt.trim(),
        body: normalizeBody(parsed.data.body),
        category,
        subcategory: parsed.data.subcategory,
        cover_image_url: coverImageUrl,
        gallery_image_urls: galleryImageUrls,
        author: parsed.data.author.trim(),
      })
      .eq("id", parsed.data.postId)
      .select(CONTENT_POST_SELECT)
      .single<ContentPostRecord>();

    if (error) {
      if (isMissingContentPostsSchemaError(error)) {
        return {
          error: missingContentPostsSchemaMessage(),
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

  if (!hasRichTextContent(post.body)) {
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
        category: normalizeContentPostCategory(existingPost.category),
        subcategory: existingPost.subcategory ?? null,
        cover_image_url: normalizeStoredCoverImageUrl(existingPost.cover_image_url),
        gallery_image_urls: existingPost.gallery_image_urls ?? [],
        author: existingPost.author.trim(),
        status,
        published_at: nextPublishedAt,
      })
      .eq("id", existingPost.id)
      .select(CONTENT_POST_SELECT)
      .single<ContentPostRecord>();

    if (error) {
      if (isMissingContentPostsSchemaError(error)) {
        return {
          error: missingContentPostsSchemaMessage(),
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

function getDocumentExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function normalizeImportedBody(value: string) {
  const body = normalizeRichTextContent(value);

  if (!hasRichTextContent(body)) {
    throw new Error("The document does not contain extractable text.");
  }

  if (body.length > CONTENT_BODY_MAX_LENGTH) {
    throw new Error("The imported document is too long. Keep the article under 40,000 characters.");
  }

  return body;
}

export async function importContentPostDocument(
  formData: FormData
): Promise<ContentPostDocumentImportResult> {
  const context = await requireAdminAction();
  if ("error" in context) {
    return { success: false, error: context.error };
  }

  const document = formData.get("document");
  if (!(document instanceof File) || document.size === 0) {
    return { success: false, error: "Choose a Word (.docx) or PDF document to import." };
  }

  if (document.size > CONTENT_DOCUMENT_MAX_BYTES) {
    return { success: false, error: "Documents must be 15MB or smaller." };
  }

  const extension = getDocumentExtension(document.name);
  const isDocx =
    extension === "docx" ||
    document.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isPdf = extension === "pdf" || document.type === "application/pdf";

  if (!isDocx && !isPdf) {
    return { success: false, error: "Upload a Word (.docx) or PDF document." };
  }

  try {
    const bytes = Buffer.from(await document.arrayBuffer());

    if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.convertToHtml(
        { buffer: bytes },
        {
          convertImage: mammoth.images.imgElement(async () => ({ src: "" })),
        }
      );

      return {
        success: true,
        body: normalizeImportedBody(result.value),
        fileName: document.name,
        warnings: result.messages.map((message) => message.message).filter(Boolean).slice(0, 5),
      };
    }

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: bytes });
    try {
      const result = await parser.getText();
      return {
        success: true,
        body: normalizeImportedBody(result.text),
        fileName: document.name,
        warnings: [],
      };
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "The document could not be imported. Check that it is not encrypted or damaged.",
    };
  }
}
