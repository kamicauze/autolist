"use client";

import * as React from "react";
import Image from "next/image";
import { Dropzone } from "@/components/ui/dropzone";
import { MAX_FILE_SIZE_BYTES, MIN_TOTAL_IMAGES, useWizard } from "./wizard-context";
import { sellerGhostButtonClass, sellerInputClass, sellerLabelClass } from "../seller-dashboard-ui";

function GalleryPreview({
  file,
  badge,
  onSetCover,
  onRemove,
}: {
  file: File;
  badge?: string;
  onSetCover: () => void;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState("");

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#ededed] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="relative aspect-[1.4/1] bg-[#f3f4f6]">
        {previewUrl ? (
          <Image src={previewUrl} alt={file.name} fill unoptimized className="object-cover" />
        ) : null}
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#2563eb] px-3 py-1 text-[11px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <p className="truncate text-[13px] font-medium text-[#202224]">{file.name}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSetCover}
            className="rounded-[12px] border border-[#d9d9d9] bg-white px-3 py-2 text-[12px] font-medium text-[#202224]"
          >
            Make cover
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-[12px] border border-[#ffd6d3] bg-[#fff4f3] px-3 py-2 text-[12px] font-semibold text-[#f04438]"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepMedia() {
  const {
    isEditing,
    draft,
    updateField,
    coverFile,
    galleryFiles,
    documentFiles,
    handleCoverSelection,
    handleGallerySelection,
    removeGalleryFile,
    handleDocumentSelection,
    removeDocumentFile,
    mediaValidationError,
  } = useWizard();
  const hasReplacementMedia = coverFile !== null || galleryFiles.length > 0;
  const existingGalleryImageNames =
    isEditing && !hasReplacementMedia ? draft.galleryImageNames : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-[28px] font-semibold text-[#202224]">Media Uploads</h2>
        <p className="mt-2 text-[14px] leading-6 text-[#767676]">
          Add clean photos and any optional supporting media before the listing is submitted.
        </p>
      </div>

      <div className="space-y-6 rounded-[24px] border border-[#ededed] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
        <div className="space-y-5">
          {isEditing && !hasReplacementMedia ? (
            <div className="rounded-[18px] border border-[#dbe8ff] bg-[#f6f9ff] px-4 py-3 text-[13px] leading-6 text-[#3157c8]">
              Current listing media is preserved as-is. Upload a new cover image and gallery set only if you want
              to replace the existing photos.
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <label className={sellerLabelClass}>Cover Image</label>
              <p className="mb-3 text-[13px] text-[#7b7b7b]">
                Upload a primary image or choose one from the gallery below.
              </p>
              <Dropzone
                onFilesAdded={handleCoverSelection}
                files={draft.coverImageName ? [{ name: draft.coverImageName } as File] : []}
                onRemove={
                  isEditing && !hasReplacementMedia
                    ? undefined
                    : () => updateField("coverImageName", null)
                }
                accept="image/*"
                multiple={false}
                maxSize={MAX_FILE_SIZE_BYTES}
                className="rounded-[22px] border-[#d9d9d9] bg-[#faf9f7] py-12"
              />
            </div>

            <div>
              <label className={sellerLabelClass}>Upload Media</label>
              <p className="mb-3 text-[13px] text-[#7b7b7b]">
                PNG or JPG files up to 10MB each. Minimum {MIN_TOTAL_IMAGES} photos in total.
              </p>
              <Dropzone
                onFilesAdded={handleGallerySelection}
                showFiles={false}
                accept="image/*"
                multiple
                maxSize={MAX_FILE_SIZE_BYTES}
                className="rounded-[22px] border-[#d9d9d9] bg-white py-16"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-[20px] font-semibold text-[#202224]">
                  Uploaded media files ({galleryFiles.length + (draft.coverImageName ? 1 : 0)})
                </h3>
                <p className="mt-1 text-[13px] text-[#7b7b7b]">
                  Choose the image that should appear as the cover card on the public listing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isEditing && !hasReplacementMedia) return;
                  updateField("coverImageName", null);
                  updateField("coverFromGalleryIndex", galleryFiles.length > 0 ? 0 : null);
                }}
                className={sellerGhostButtonClass}
                disabled={isEditing && !hasReplacementMedia}
              >
                Use gallery cover
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {draft.coverImageName ? (
                <div className="overflow-hidden rounded-[18px] border border-[#2563eb]/20 bg-[#eef4ff] p-4">
                  <div className="flex h-full min-h-[160px] flex-col justify-between rounded-[14px] border border-dashed border-[#b7cdfd] bg-white/70 p-4">
                    <div>
                      <span className="rounded-full bg-[#2563eb] px-3 py-1 text-[11px] font-semibold text-white">
                        Cover
                      </span>
                      <p className="mt-4 line-clamp-2 text-[14px] font-semibold text-[#202224]">
                        {draft.coverImageName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("coverImageName", null)}
                      className="mt-4 rounded-[12px] border border-[#d9d9d9] bg-white px-3 py-2 text-[12px] font-medium text-[#202224]"
                    >
                      Remove cover
                    </button>
                  </div>
                </div>
              ) : null}

              {galleryFiles.length === 0 && !draft.coverImageName ? (
                <div className="col-span-full rounded-[18px] border border-dashed border-[#d9d9d9] px-4 py-10 text-center text-[13px] text-[#8a8a8a]">
                  No gallery media uploaded yet.
                </div>
              ) : null}

              {existingGalleryImageNames.map((name) => (
                <div
                  key={name}
                  className="overflow-hidden rounded-[18px] border border-[#ededed] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex aspect-[1.4/1] items-center justify-center bg-[#f3f4f6] px-4 text-center text-[13px] font-medium text-[#6b7280]">
                    Existing image
                  </div>
                  <div className="p-4">
                    <p className="truncate text-[13px] font-medium text-[#202224]">{name}</p>
                  </div>
                </div>
              ))}

              {galleryFiles.map((file, index) => (
                <GalleryPreview
                  key={`${file.name}-${index}`}
                  file={file}
                  badge={draft.coverFromGalleryIndex === index && !draft.coverImageName ? "Cover" : undefined}
                  onSetCover={() => {
                    updateField("coverImageName", null);
                    updateField("coverFromGalleryIndex", index);
                  }}
                  onRemove={() => removeGalleryFile(file)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <label className={sellerLabelClass}>Video URL</label>
              <input
                value={draft.videoUrl}
                onChange={(event) => updateField("videoUrl", event.target.value)}
                placeholder="Your URL"
                className={sellerInputClass}
              />
            </div>

            <div>
              <label className={sellerLabelClass}>Documents (Optional)</label>
              <Dropzone
                onFilesAdded={handleDocumentSelection}
                files={documentFiles}
                onRemove={removeDocumentFile}
                accept="image/*,.pdf"
                multiple
                maxSize={MAX_FILE_SIZE_BYTES}
                className="rounded-[18px] border-[#d9d9d9] bg-[#faf9f7] py-6"
              />
            </div>
          </div>

          {mediaValidationError ? (
            <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
              {mediaValidationError}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
