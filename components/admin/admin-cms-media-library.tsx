/* eslint-disable @next/next/no-img-element */

"use client";

import * as React from "react";
import { Check, ImageIcon, Library, Search, Upload } from "lucide-react";
import { uploadCmsImage } from "@/lib/actions/cms";
import type { CmsBlockKey } from "@/lib/types/cms";
import type { CmsMediaAsset, CmsMediaUsageContext } from "@/lib/types/cms-media";
import { cn } from "@/lib/utils";
import {
  AdminSectionCard,
  AdminStatCard,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSurfaceClass,
} from "./admin-ui";

type FeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

export type CmsMediaUploadInput = {
  image: File;
  altText: string;
  usageContext: CmsMediaUsageContext;
  blockKey?: CmsBlockKey;
};

type CmsMediaFieldProps = {
  assets: CmsMediaAsset[];
  schemaReady: boolean;
  value: string;
  label: string;
  description?: string;
  placeholder?: string;
  usageContext: CmsMediaUsageContext;
  blockKey?: CmsBlockKey;
  onChange: (url: string) => void;
  onAssetUploaded: (asset: CmsMediaAsset) => void;
  onFeedback?: (feedback: FeedbackState) => void;
};

type CmsMediaUploaderProps = {
  schemaReady: boolean;
  usageContext: CmsMediaUsageContext;
  blockKey?: CmsBlockKey;
  buttonLabel?: string;
  onUploaded: (result: { url: string; asset: CmsMediaAsset | null; message: string }) => void;
  onFeedback: (feedback: FeedbackState) => void;
};

function formatBytes(value: number | null) {
  if (!value) return "Unknown size";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeContextLabel(value: CmsMediaUsageContext) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function CmsMediaUploader({
  schemaReady,
  usageContext,
  blockKey,
  buttonLabel = "Upload",
  onUploaded,
  onFeedback,
}: CmsMediaUploaderProps) {
  const [altText, setAltText] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    event.target.value = "";

    if (!image) return;

    const formData = new FormData();
    formData.set("image", image);
    formData.set("usageContext", usageContext);
    formData.set("altText", altText);
    if (blockKey) {
      formData.set("blockKey", blockKey);
    }

    setIsUploading(true);
    onFeedback(null);

    try {
      const result = await uploadCmsImage(formData);

      if (!result.success) {
        onFeedback({ tone: "error", message: result.error });
        return;
      }

      setAltText("");
      onUploaded({
        url: result.url,
        asset: result.asset,
        message: result.message,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <input
        value={altText}
        onChange={(event) => setAltText(event.target.value)}
        className={adminInputClass}
        placeholder="Alt text for the uploaded image"
      />
      <label
        className={cn(
          schemaReady ? adminPrimaryButtonClass : adminGhostButtonClass,
          "cursor-pointer gap-2",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <Upload className="h-4 w-4" />
        {isUploading ? "Uploading..." : buttonLabel}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={isUploading}
          className="sr-only"
        />
      </label>
    </div>
  );
}

function CmsMediaAssetGrid({
  assets,
  selectedUrl,
  onSelect,
}: {
  assets: CmsMediaAsset[];
  selectedUrl?: string;
  onSelect?: (asset: CmsMediaAsset) => void;
}) {
  const [query, setQuery] = React.useState("");
  const filteredAssets = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return assets;

    return assets.filter((asset) =>
      [asset.fileName, asset.altText, asset.usageContext]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery))
    );
  }, [assets, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={cn(adminInputClass, "pl-9")}
          placeholder="Search media by file, alt text, or type"
        />
      </div>

      {filteredAssets.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#cbd5e1] px-5 py-8 text-center text-[13px] text-[#64748b]">
          No media assets match this view yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredAssets.map((asset) => {
            const isSelected = selectedUrl === asset.url;

            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect?.(asset)}
                className={cn(
                  "overflow-hidden rounded-[14px] border bg-white text-left transition",
                  onSelect ? "hover:border-primary hover:shadow-sm" : "cursor-default",
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-[#e5e7eb]"
                )}
              >
                <div className="relative aspect-[16/10] bg-[#f1f5f9]">
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.fileName}
                    className="h-full w-full object-cover"
                  />
                  {isSelected ? (
                    <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2 px-3 py-3">
                  <p className="truncate text-[13px] font-semibold text-[#111827]">
                    {asset.altText || asset.fileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b]">
                    <span>{normalizeContextLabel(asset.usageContext)}</span>
                    <span>{formatBytes(asset.fileSizeBytes)}</span>
                    <span>{formatDate(asset.createdAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminCmsMediaField({
  assets,
  schemaReady,
  value,
  label,
  description,
  placeholder,
  usageContext,
  blockKey,
  onChange,
  onAssetUploaded,
  onFeedback,
}: CmsMediaFieldProps) {
  const [showLibrary, setShowLibrary] = React.useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[13px] font-medium text-[#111827]">{label}</span>
          {description ? <p className="mt-1 text-[12px] text-[#6b7280]">{description}</p> : null}
        </div>
        <button
          type="button"
          className={cn(adminGhostButtonClass, "h-9 gap-2 px-3")}
          onClick={() => setShowLibrary((current) => !current)}
        >
          <Library className="h-4 w-4" />
          {showLibrary ? "Hide library" : "Use library"}
        </button>
      </div>

      <div className="grid gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={adminInputClass}
          placeholder={placeholder}
        />

        <CmsMediaUploader
          schemaReady={schemaReady}
          usageContext={usageContext}
          blockKey={blockKey}
          buttonLabel="Upload image"
          onFeedback={(feedback) => onFeedback?.(feedback)}
          onUploaded={(result) => {
            onChange(result.url);
            if (result.asset) {
              onAssetUploaded(result.asset);
            }
            onFeedback?.({ tone: "success", message: result.message });
          }}
        />
      </div>

      {!schemaReady ? (
        <p className="text-[12px] leading-5 text-[#b45309]">
          The media table is not available yet. Uploads can still fill the field, but assets will
          not appear in the library until the CMS media migration is applied.
        </p>
      ) : null}

      {showLibrary ? (
        <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-3">
          <CmsMediaAssetGrid
            assets={assets}
            selectedUrl={value}
            onSelect={(asset) => {
              onChange(asset.url);
              onFeedback?.({ tone: "success", message: "Selected image from media library." });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AdminCmsMediaLibrary({
  assets,
  schemaReady,
  onAssetUploaded,
}: {
  assets: CmsMediaAsset[];
  schemaReady: boolean;
  onAssetUploaded: (asset: CmsMediaAsset) => void;
}) {
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);

  const totalSize = assets.reduce((sum, asset) => sum + (asset.fileSizeBytes ?? 0), 0);
  const assetTypes = new Set(assets.map((asset) => asset.usageContext)).size;

  return (
    <div className="space-y-6">
      {!schemaReady ? (
        <div className="rounded-[16px] border border-[#fde68a] bg-[#fffbeb] px-5 py-4 text-[13px] text-[#92400e]">
          The <span className="font-mono">cms_media_assets</span> table is not available yet. Apply
          the CMS media migration to persist uploads in the library.
        </div>
      ) : null}

      {feedback ? (
        <div
          className={cn(
            adminSurfaceClass,
            "px-5 py-4 text-[13px]",
            feedback.tone === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div data-tour="cms-media-stats" className="grid gap-4 xl:grid-cols-3">
        <AdminStatCard
          label="Media assets"
          value={assets.length.toLocaleString("en-KE")}
          icon={<ImageIcon className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Asset types"
          value={assetTypes.toLocaleString("en-KE")}
          icon={<Library className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Optimized size"
          value={formatBytes(totalSize)}
          icon={<Upload className="h-5 w-5" />}
        />
      </div>

      <div data-tour="cms-media-upload">
      <AdminSectionCard
        title="Upload Media"
        description="Upload JPG, PNG, or WebP files. Images are optimized to WebP and saved for reuse across CMS modules."
      >
        <CmsMediaUploader
          schemaReady={schemaReady}
          usageContext="general"
          buttonLabel="Upload to library"
          onFeedback={setFeedback}
          onUploaded={(result) => {
            if (result.asset) {
              onAssetUploaded(result.asset);
            }
            setFeedback({ tone: "success", message: result.message });
          }}
        />
      </AdminSectionCard>
      </div>

      <div data-tour="cms-media-library">
      <AdminSectionCard
        title="Media Library"
        description="Reusable images for homepage, blog covers, banners, offers, and future CMS modules."
      >
        <CmsMediaAssetGrid assets={assets} />
      </AdminSectionCard>
      </div>
    </div>
  );
}
