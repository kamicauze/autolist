"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/guard";
import {
  CMS_SPECIAL_OFFER_SELECT,
  normalizeCmsSpecialOffer,
} from "@/lib/data/cms-special-offers";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CMS_SPECIAL_OFFER_STATUSES,
  type CmsSpecialOfferMutationResult,
  type CmsSpecialOfferRecord,
  type SaveCmsSpecialOfferInput,
} from "@/lib/types/cms-special-offers";

const saveCmsSpecialOfferSchema = z.object({
  offerId: z.string().uuid("Unknown offer."),
  title: z.string().trim().min(2, "Offer title is required.").max(140),
  audience: z.string().trim().min(2, "Audience is required.").max(120),
  description: z.string().trim().max(500, "Description is too long."),
  imageUrl: z.string().trim().max(2000),
  targetUrl: z.string().trim().max(2000),
  status: z.enum(CMS_SPECIAL_OFFER_STATUSES),
  startsAt: z.string().trim().max(80),
  endsAt: z.string().trim().max(80),
  redemptionCount: z.number().int().min(0).max(999999),
  sortOrder: z.number().int().min(0).max(999),
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

function revalidateSpecialOfferPaths() {
  revalidatePath("/");
  revalidatePath("/admin/special-offers");
}

function toMutationError(error: unknown): CmsSpecialOfferMutationResult {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: "Something went wrong while saving the special offer." };
}

export async function createCmsSpecialOfferDraft(): Promise<CmsSpecialOfferMutationResult> {
  try {
    const context = await requireAdminAction();
    if ("error" in context) {
      return { success: false, error: context.error };
    }

    const { data, error } = await context.supabase
      .from("cms_special_offers")
      .insert({
        title: "Untitled offer",
        audience: "All visitors",
        description: "",
        image_url: "",
        target_url: null,
        status: "draft",
        starts_at: null,
        ends_at: null,
        redemption_count: 0,
        sort_order: 0,
        created_by: context.user.id,
      })
      .select(CMS_SPECIAL_OFFER_SELECT)
      .single<CmsSpecialOfferRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          success: false,
          error:
            "CMS special offers storage is not ready yet. Run the cms_special_offers migration first.",
        };
      }

      return { success: false, error: error.message || "Unable to create offer draft." };
    }

    const offer = normalizeCmsSpecialOffer(data);
    revalidateSpecialOfferPaths();

    return {
      success: true,
      offer,
      message: "Offer draft created.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function saveCmsSpecialOffer(
  input: SaveCmsSpecialOfferInput
): Promise<CmsSpecialOfferMutationResult> {
  try {
    const parsed = saveCmsSpecialOfferSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid special offer update.",
      };
    }

    const context = await requireAdminAction();
    if ("error" in context) {
      return { success: false, error: context.error };
    }

    const imageUrl = normalizeOptionalPathOrUrl(parsed.data.imageUrl, "Image URL");
    const targetUrl = normalizeOptionalPathOrUrl(parsed.data.targetUrl, "Target URL");
    const startsAt = normalizeOptionalDate(parsed.data.startsAt, "Start date");
    const endsAt = normalizeOptionalDate(parsed.data.endsAt, "End date");

    if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      return { success: false, error: "End date must be after the start date." };
    }

    if (parsed.data.status === "active") {
      if (!parsed.data.description.trim()) {
        return { success: false, error: "Add a description before activating the offer." };
      }

      if (!imageUrl) {
        return { success: false, error: "Add an offer image before activating the offer." };
      }

      if (!targetUrl) {
        return { success: false, error: "Add a target URL before activating the offer." };
      }
    }

    const { data, error } = await context.supabase
      .from("cms_special_offers")
      .update({
        title: parsed.data.title.trim(),
        audience: parsed.data.audience.trim(),
        description: parsed.data.description.trim(),
        image_url: imageUrl ?? "",
        target_url: targetUrl,
        status: parsed.data.status,
        starts_at: startsAt,
        ends_at: endsAt,
        redemption_count: parsed.data.redemptionCount,
        sort_order: parsed.data.sortOrder,
      })
      .eq("id", parsed.data.offerId)
      .select(CMS_SPECIAL_OFFER_SELECT)
      .single<CmsSpecialOfferRecord>();

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          success: false,
          error:
            "CMS special offers storage is not ready yet. Run the cms_special_offers migration first.",
        };
      }

      return { success: false, error: error.message || "Unable to save special offer." };
    }

    const offer = normalizeCmsSpecialOffer(data);
    revalidateSpecialOfferPaths();

    return {
      success: true,
      offer,
      message: offer.status === "active" ? "Offer saved and active." : "Offer saved.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}
