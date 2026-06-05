"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { normalizeRichTextContent } from "@/lib/content-rich-text";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CONTENT_PAGE_DEFINITIONS,
  CONTENT_PAGE_SLUGS,
  CONTENT_PAGE_STATUSES,
  type SaveContentPageInput,
  type SaveContentPageResult,
} from "@/lib/types/content-pages";
import { mapContentPageRow } from "@/lib/data/content-pages";

type ExistingContentPageRow = {
  published_at: string | null;
};

type SavedContentPageRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const CONTENT_PAGE_SELECT = `
  id,
  slug,
  title,
  summary,
  body,
  status,
  seo_title,
  seo_description,
  published_at,
  created_at,
  updated_at
`;

const saveContentPageSchema = z.object({
  slug: z.enum(CONTENT_PAGE_SLUGS),
  title: z.string().trim().min(1, "Title is required.").max(160, "Title is too long."),
  summary: z.string().trim().max(320, "Summary is too long."),
  body: z.string().trim().min(1, "Body is required."),
  status: z.enum(CONTENT_PAGE_STATUSES),
  seoTitle: z.string().trim().max(160, "SEO title is too long."),
  seoDescription: z.string().trim().max(320, "SEO description is too long."),
});

function toNullableText(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function saveContentPage(input: SaveContentPageInput): Promise<SaveContentPageResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return { success: false, error: adminContext.error };
  }

  const parsed = saveContentPageSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid content page input.";
    return { success: false, error: message };
  }

  const value = parsed.data;

  const { data: existing, error: existingError } = await adminContext.supabase
    .from("content_pages")
    .select("published_at")
    .eq("slug", value.slug)
    .maybeSingle<ExistingContentPageRow>();

  if (isMissingRelationError(existingError)) {
    return {
      success: false,
      error: "The content_pages table is missing. Apply the latest Supabase migration first.",
    };
  }

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const publishedAt =
    value.status === "published"
      ? existing?.published_at ?? new Date().toISOString()
      : null;

  const { data, error } = await adminContext.supabase
    .from("content_pages")
    .upsert(
      {
        slug: value.slug,
        title: value.title,
        summary: toNullableText(value.summary),
        body: normalizeRichTextContent(value.body),
        status: value.status,
        seo_title: toNullableText(value.seoTitle),
        seo_description: toNullableText(value.seoDescription),
        published_at: publishedAt,
      },
      {
        onConflict: "slug",
      }
    )
    .select(CONTENT_PAGE_SELECT)
    .maybeSingle<SavedContentPageRow>();

  if (isMissingRelationError(error)) {
    return {
      success: false,
      error: "The content_pages table is missing. Apply the latest Supabase migration first.",
    };
  }

  if (error || !data) {
    return { success: false, error: error?.message || "Failed to save the content page." };
  }

  const page = mapContentPageRow(data);
  const path = CONTENT_PAGE_DEFINITIONS[page.slug].path;

  revalidatePath("/admin/cms");
  revalidatePath(path);

  return {
    success: true,
    page,
    message:
      value.status === "published"
        ? `Published ${CONTENT_PAGE_DEFINITIONS[page.slug].label}.`
        : `Saved ${CONTENT_PAGE_DEFINITIONS[page.slug].label} as draft.`,
  };
}
