"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import { CMS_BANNER_SELECT, normalizeCmsBanner } from "@/lib/data/cms-banners";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CMS_BANNER_PLACEMENTS,
  CMS_BANNER_STATUSES,
  type CmsBannerMutationResult,
  type CmsBannerRecord,
  type DeleteCmsBannerResult,
  type SaveCmsBannerInput,
} from "@/lib/types/cms-banners";

const saveCmsBannerSchema = z.object({
  bannerId: z.string().uuid("Unknown banner."),
  title: z.string().trim().min(2, "Banner title is required.").max(120),
  slug: z.string().trim().max(160),
  placement: z.enum(CMS_BANNER_PLACEMENTS),
  status: z.enum(CMS_BANNER_STATUSES),
  desktopImageUrl: z.string().trim().max(2000),
  mobileImageUrl: z.string().trim().max(2000),
  altText: z.string().trim().max(180, "Alt text is too long."),
  summary: z.string().trim().max(240, "Summary is too long."),
  body: z.string().trim().max(5000, "Detail body is too long."),
  ctaLabel: z.string().trim().max(60, "CTA label is too long."),
  targetUrl: z.string().trim().max(2000),
  startsAt: z.string().trim().max(80),
  endsAt: z.string().trim().max(80),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

const bannerIdSchema = z.object({
  bannerId: z.string().uuid("Unknown banner."),
});

function normalizeOptionalPathOrUrl(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("invalid-protocol");
    }

    return trimmed;
  } catch {
    throw new Error(`${label} must be a site path or a valid http/https URL.`);
  }
}

function normalizeOptionalDate(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date and time.`);
  }

  return date.toISOString();
}

function slugifyBanner(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return normalized || "banner";
}

function revalidateBannerPaths() {
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/vehicle/[id]", "page");
  revalidatePath("/admin/ads-banners");
  revalidatePath("/dashboard");
}

function toMutationError(error: unknown): CmsBannerMutationResult {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: "Something went wrong while saving the banner." };
}

export async function createCmsBannerDraft(): Promise<CmsBannerMutationResult> {
  try {
    const context = await requireAdminAction();
    if ("error" in context) {
      return { success: false, error: context.error };
    }

    const { data, error } = await context.supabase
      .from("cms_banners")
      .insert({
        title: "Untitled banner",
        slug: `untitled-banner-${crypto.randomUUID().slice(0, 8)}`,
        placement: "home_top",
        status: "draft",
        desktop_image_url: "",
        mobile_image_url: null,
        alt_text: "",
        summary: null,
        body: null,
        cta_label: null,
        target_url: null,
        starts_at: null,
        ends_at: null,
        sort_order: 0,
        created_by: context.user.id,
      })
      .select(CMS_BANNER_SELECT)
      .single<CmsBannerRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          success: false,
          error: "CMS banner storage is not ready yet. Run the cms_banners migration first.",
        };
      }

      return { success: false, error: error.message || "Unable to create banner draft." };
    }

    const banner = normalizeCmsBanner(data);
    revalidateBannerPaths();

    return {
      success: true,
      banner,
      message: "Banner draft created.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function saveCmsBanner(input: SaveCmsBannerInput): Promise<CmsBannerMutationResult> {
  try {
    const parsed = saveCmsBannerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid banner update.",
      };
    }

    const context = await requireAdminAction();
    if ("error" in context) {
      return { success: false, error: context.error };
    }

    const desktopImageUrl = normalizeOptionalPathOrUrl(
      parsed.data.desktopImageUrl,
      "Desktop image URL"
    );
    const mobileImageUrl = normalizeOptionalPathOrUrl(
      parsed.data.mobileImageUrl,
      "Mobile image URL"
    );
    const targetUrl = normalizeOptionalPathOrUrl(parsed.data.targetUrl, "Target URL");
    const startsAt = normalizeOptionalDate(parsed.data.startsAt, "Start date");
    const endsAt = normalizeOptionalDate(parsed.data.endsAt, "End date");
    const slugBase = slugifyBanner(parsed.data.slug || parsed.data.title);
    const slug = `${slugBase}-${parsed.data.bannerId.slice(0, 8)}`;

    if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      return { success: false, error: "End date must be after the start date." };
    }

    if (parsed.data.status === "active" && !desktopImageUrl) {
      return { success: false, error: "Add a desktop image before activating the banner." };
    }

    const { data, error } = await context.supabase
      .from("cms_banners")
      .update({
        title: parsed.data.title.trim(),
        slug,
        placement: parsed.data.placement,
        status: parsed.data.status,
        desktop_image_url: desktopImageUrl ?? "",
        mobile_image_url: mobileImageUrl,
        alt_text: parsed.data.altText.trim() || null,
        summary: parsed.data.summary.trim() || null,
        body: parsed.data.body.trim() || null,
        cta_label: parsed.data.ctaLabel.trim() || null,
        target_url: targetUrl,
        starts_at: startsAt,
        ends_at: endsAt,
        sort_order: parsed.data.sortOrder,
      })
      .eq("id", parsed.data.bannerId)
      .select(CMS_BANNER_SELECT)
      .single<CmsBannerRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          success: false,
          error: "CMS banner storage is not ready yet. Run the cms_banners migration first.",
        };
      }

      return { success: false, error: error.message || "Unable to save banner." };
    }

    const banner = normalizeCmsBanner(data);
    revalidateBannerPaths();
    if (banner.slug) {
      revalidatePath(`/ads/${banner.slug}`);
    }

    return {
      success: true,
      banner,
      message: banner.status === "active" ? "Banner saved and active." : "Banner saved.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function deleteCmsBanner(bannerId: string): Promise<DeleteCmsBannerResult> {
  const parsed = bannerIdSchema.safeParse({ bannerId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Unknown banner.",
    };
  }

  const context = await requireAdminAction();
  if ("error" in context) {
    return { success: false, error: context.error };
  }

  const { error } = await context.supabase
    .from("cms_banners")
    .delete()
    .eq("id", parsed.data.bannerId);

  if (error) {
    if (isMissingRelationError(error)) {
      return {
        success: false,
        error: "CMS banner storage is not ready yet. Run the cms_banners migration first.",
      };
    }

    return { success: false, error: error.message || "Unable to delete banner." };
  }

  revalidateBannerPaths();

  return {
    success: true,
    bannerId: parsed.data.bannerId,
    message: "Banner deleted.",
  };
}
