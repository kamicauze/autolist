"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { mapCmsBlockRow } from "@/lib/data/cms";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CMS_BLOCK_DEFINITIONS,
  CMS_BLOCK_KEYS,
  type CmsBlockContent,
  type CmsBlockKey,
  type CmsBlockStatus,
  type SaveCmsBlockInput,
  type SaveCmsBlockResult,
} from "@/lib/types/cms";

type ExistingCmsBlockRow = {
  published_content: unknown;
  published_at: string | null;
  status: CmsBlockStatus;
};

type SavedCmsBlockRow = {
  id: string;
  block_key: string;
  label: string;
  description: string | null;
  draft_content: unknown;
  published_content: unknown;
  status: CmsBlockStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const CMS_BLOCK_SELECT = `
  id,
  block_key,
  label,
  description,
  draft_content,
  published_content,
  status,
  published_at,
  created_at,
  updated_at
`;

const heroBlockSchema = z.object({
  headline: z.string().trim().min(1, "Hero headline is required.").max(90),
  subheading: z.string().trim().min(1, "Hero subheading is required.").max(220),
  backgroundImageUrl: z
    .string()
    .trim()
    .min(1, "Hero image URL is required.")
    .max(500)
    .refine(
      (value) =>
        value.startsWith("/") ||
        value.startsWith("https://") ||
        value.startsWith("http://"),
      "Use a site path like /hero-car.jpg or a full image URL."
    ),
  quickSearchEnabled: z.boolean(),
});

const featuredListingsBlockSchema = z.object({
  title: z.string().trim().min(1, "Section title is required.").max(90),
  viewAllLabel: z.string().trim().min(1, "View-all label is required.").max(40),
  featuredTabLabel: z.string().trim().min(1, "Featured tab label is required.").max(40),
  recentTabLabel: z.string().trim().min(1, "Recent tab label is required.").max(40),
  favoritesTabLabel: z.string().trim().min(1, "Favorites tab label is required.").max(40),
  showTabs: z.boolean(),
  showFavoritesTab: z.boolean(),
  featuredLimit: z.number().int().min(1).max(12),
  recentLimit: z.number().int().min(1).max(12),
});

const sectionsBlockSchema = z.object({
  showHowItWorks: z.boolean(),
  showDiscoverMore: z.boolean(),
  showSellVehicle: z.boolean(),
  showVideoReviews: z.boolean(),
  showServices: z.boolean(),
  showNews: z.boolean(),
  showBrandLogos: z.boolean(),
  showSocialMedia: z.boolean(),
});

const saveCmsBlockSchema = z.object({
  blockKey: z.enum(CMS_BLOCK_KEYS),
  content: z.unknown(),
  publish: z.boolean(),
});

function validateBlockContent(
  blockKey: CmsBlockKey,
  content: unknown
): { success: true; content: CmsBlockContent } | { success: false; error: string } {
  const schema =
    blockKey === "home_hero"
      ? heroBlockSchema
      : blockKey === "home_featured_listings"
        ? featuredListingsBlockSchema
        : sectionsBlockSchema;

  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid CMS block content.",
    };
  }

  return {
    success: true,
    content: parsed.data,
  };
}

export async function saveCmsBlock(input: SaveCmsBlockInput): Promise<SaveCmsBlockResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return { success: false, error: adminContext.error };
  }

  const parsed = saveCmsBlockSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid CMS block input.",
    };
  }

  const content = validateBlockContent(parsed.data.blockKey, parsed.data.content);
  if (!content.success) {
    return content;
  }

  const definition = CMS_BLOCK_DEFINITIONS[parsed.data.blockKey];
  const { data: existing, error: existingError } = await adminContext.supabase
    .from("cms_blocks")
    .select("published_content, published_at, status")
    .eq("block_key", parsed.data.blockKey)
    .maybeSingle<ExistingCmsBlockRow>();

  if (isMissingRelationError(existingError)) {
    return {
      success: false,
      error: "The cms_blocks table is missing. Apply the latest Supabase migration first.",
    };
  }

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const hasExistingPublishedContent = Boolean(existing?.published_content);
  const shouldPublish = parsed.data.publish;
  const now = new Date().toISOString();
  const payload = {
    block_key: parsed.data.blockKey,
    label: definition.label,
    description: definition.description,
    draft_content: content.content,
    published_content: shouldPublish
      ? content.content
      : existing?.published_content ?? null,
    status: shouldPublish || hasExistingPublishedContent ? "published" : "draft",
    published_at: shouldPublish ? now : existing?.published_at ?? null,
    updated_by: adminContext.user.id,
  };

  const { data, error } = await adminContext.supabase
    .from("cms_blocks")
    .upsert(payload, { onConflict: "block_key" })
    .select(CMS_BLOCK_SELECT)
    .maybeSingle<SavedCmsBlockRow>();

  if (isMissingRelationError(error)) {
    return {
      success: false,
      error: "The cms_blocks table is missing. Apply the latest Supabase migration first.",
    };
  }

  if (error || !data) {
    return { success: false, error: error?.message || "Failed to save the CMS block." };
  }

  const block = mapCmsBlockRow(data);
  if (!block) {
    return { success: false, error: "The saved CMS block could not be read." };
  }

  revalidatePath("/");
  revalidatePath("/admin/cms");

  return {
    success: true,
    block,
    message: shouldPublish ? `Published ${definition.label}.` : `Saved ${definition.label} draft.`,
  };
}
