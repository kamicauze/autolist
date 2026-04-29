export const CMS_MEDIA_USAGE_CONTEXTS = [
  "homepage_hero",
  "blog_cover",
  "banner",
  "offer",
  "general",
] as const;

export type CmsMediaUsageContext = (typeof CMS_MEDIA_USAGE_CONTEXTS)[number];

export type CmsMediaAssetRecord = {
  id: string;
  storage_key: string;
  url: string;
  file_name: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  alt_text: string | null;
  usage_context: CmsMediaUsageContext;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsMediaAsset = {
  id: string;
  storageKey: string;
  url: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  altText: string | null;
  usageContext: CmsMediaUsageContext;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCmsMediaData = {
  schemaReady: boolean;
  assets: CmsMediaAsset[];
};

export type UploadCmsImageResult =
  | {
      success: true;
      key: string;
      url: string;
      asset: CmsMediaAsset | null;
      message: string;
    }
  | {
      success: false;
      error: string;
    };
