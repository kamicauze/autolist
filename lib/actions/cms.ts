"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { mapCmsBlockRow } from "@/lib/data/cms";
import { CMS_MEDIA_ASSET_SELECT, normalizeCmsMediaAsset } from "@/lib/data/cms-media";
import { r2 } from "@/lib/r2";
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
import {
  CMS_MEDIA_USAGE_CONTEXTS,
  type CmsMediaAssetRecord,
  type UploadCmsImageResult,
} from "@/lib/types/cms-media";

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

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const CMS_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const CMS_IMAGE_ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

const uploadCmsImageSchema = z.object({
  usageContext: z.enum(CMS_MEDIA_USAGE_CONTEXTS).default("general"),
  altText: z.string().trim().max(180, "Alt text is too long.").optional(),
});

function sanitizeCmsImageBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[a-z0-9]+$/i, "");
  const baseName = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return baseName || "image";
}

function buildCmsImageKey(folder: string, fileName: string) {
  return `cms/${folder}/${Date.now()}-${nanoid(10)}-${sanitizeCmsImageBaseName(fileName)}.webp`;
}

function buildCmsImageUrl(key: string) {
  const params = new URLSearchParams({
    key,
    variant: "original",
  });

  return `/api/listing-image?${params.toString()}`;
}

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

export async function uploadCmsImage(formData: FormData): Promise<UploadCmsImageResult> {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) {
    return { success: false, error: adminContext.error };
  }

  if (!R2_BUCKET_NAME) {
    return {
      success: false,
      error: "CMS image storage is not configured. Add the R2 environment variables first.",
    };
  }

  const uploadContext = uploadCmsImageSchema.safeParse({
    usageContext: formData.get("usageContext") || "general",
    altText: formData.get("altText") || undefined,
  });
  if (!uploadContext.success) {
    return {
      success: false,
      error: uploadContext.error.issues[0]?.message || "Invalid CMS media upload.",
    };
  }

  const blockKey = z.enum(CMS_BLOCK_KEYS).safeParse(formData.get("blockKey"));

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { success: false, error: "Choose a JPG, PNG, or WebP image to upload." };
  }

  if (image.size > CMS_IMAGE_MAX_BYTES) {
    return { success: false, error: "CMS images must be 10MB or smaller." };
  }

  if (!CMS_IMAGE_ACCEPTED_TYPES.has(image.type)) {
    return { success: false, error: "CMS images must be JPG, PNG, or WebP files." };
  }

  let optimizedImage: Buffer;
  let width: number | null = null;
  let height: number | null = null;
  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    const output = await sharp(bytes)
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });
    optimizedImage = output.data;
    width = output.info.width || null;
    height = output.info.height || null;
  } catch {
    return { success: false, error: "Upload a valid JPG, PNG, or WebP image." };
  }

  const key = buildCmsImageKey(
    blockKey.success ? blockKey.data : uploadContext.data.usageContext,
    image.name
  );
  const url = buildCmsImageUrl(key);

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: optimizedImage,
        ContentType: "image/webp",
      })
    );
  } catch {
    return { success: false, error: "The CMS image could not be uploaded. Check R2 storage." };
  }

  const { data: assetRow, error: assetError } = await adminContext.supabase
    .from("cms_media_assets")
    .insert({
      storage_key: key,
      url,
      file_name: image.name,
      mime_type: "image/webp",
      width,
      height,
      file_size_bytes: optimizedImage.length,
      alt_text: uploadContext.data.altText?.trim() || null,
      usage_context: uploadContext.data.usageContext,
      created_by: adminContext.user.id,
    })
    .select(CMS_MEDIA_ASSET_SELECT)
    .maybeSingle<CmsMediaAssetRecord>();

  if (assetError && !isMissingRelationError(assetError)) {
    return {
      success: false,
      error: assetError.message || "The CMS media asset could not be registered.",
    };
  }

  return {
    success: true,
    key,
    url,
    asset: assetRow ? normalizeCmsMediaAsset(assetRow) : null,
    message: assetError
      ? "Image uploaded and selected. Apply the CMS media migration to save it in the library."
      : "Image uploaded and selected. Save draft or publish to use it.",
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
