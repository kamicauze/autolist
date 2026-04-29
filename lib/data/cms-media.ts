import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type {
  AdminCmsMediaData,
  CmsMediaAsset,
  CmsMediaAssetRecord,
} from "@/lib/types/cms-media";

export const CMS_MEDIA_ASSET_SELECT = [
  "id",
  "storage_key",
  "url",
  "file_name",
  "mime_type",
  "width",
  "height",
  "file_size_bytes",
  "alt_text",
  "usage_context",
  "created_by",
  "created_at",
  "updated_at",
].join(", ");

const EMPTY_ADMIN_CMS_MEDIA_DATA: AdminCmsMediaData = {
  schemaReady: false,
  assets: [],
};

export function normalizeCmsMediaAsset(record: CmsMediaAssetRecord): CmsMediaAsset {
  return {
    id: record.id,
    storageKey: record.storage_key,
    url: record.url,
    fileName: record.file_name,
    mimeType: record.mime_type,
    width: record.width,
    height: record.height,
    fileSizeBytes: record.file_size_bytes,
    altText: record.alt_text,
    usageContext: record.usage_context,
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function getAdminCmsMediaData(limit = 120): Promise<AdminCmsMediaData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cms_media_assets")
    .select(CMS_MEDIA_ASSET_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingRelationError(error)) {
      return EMPTY_ADMIN_CMS_MEDIA_DATA;
    }

    console.error("Error fetching CMS media assets:", error);
    return EMPTY_ADMIN_CMS_MEDIA_DATA;
  }

  return {
    schemaReady: true,
    assets: ((data ?? []) as unknown as CmsMediaAssetRecord[]).map(normalizeCmsMediaAsset),
  };
}
