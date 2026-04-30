"use client";

import * as React from "react";
import Image from "next/image";
import { Dropzone } from "@/components/ui/dropzone";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_VIDEO_FILE_SIZE_BYTES,
  MIN_TOTAL_IMAGES,
  useWizard,
  type ExistingImageRef,
} from "./wizard-context";
import { sellerGhostButtonClass, sellerInputClass, sellerLabelClass } from "../seller-dashboard-ui";
import { getImageUrl } from "@/lib/utils/listings";

function ExistingImageCard({
  image,
  badge,
  onSetCover,
}: {
  image: ExistingImageRef;
  badge?: string;
  onSetCover?: () => void;
}) {
  const src = getImageUrl(image.r2_key, "card");
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#ededed] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="relative aspect-[1.4/1] bg-[#f3f4f6]">
        <Image
          src={src}
          alt={image.alt_text || image.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover"
          unoptimized
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#2563eb] px-3 py-1 text-[11px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <p className="truncate text-[13px] font-medium text-[#202224]">{image.name}</p>
        <p className="mt-1 text-[11px] text-[#8a8a8a]">
          Preserved from current listing
        </p>
        {onSetCover ? (
          <button
            type="button"
            onClick={onSetCover}
            className="rounded-[12px] border border-[#d9d9d9] bg-white px-3 py-2 text-[12px] font-medium text-[#202224]"
          >
            Make cover
          </button>
        ) : null}
      </div>
    </div>
  );
}

function GalleryPreview({
  file,
  badge,
  onSetCover,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDrop,
}: {
  file: File;
  badge?: string;
  onSetCover: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: () => void;
  onDrop: () => void;
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
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="overflow-hidden rounded-[18px] border border-[#ededed] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
    >
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
            onClick={onMoveUp}
            className="rounded-[12px] border border-[#d9d9d9] bg-white px-3 py-2 text-[12px] font-medium text-[#202224]"
          >
            Move up
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            className="rounded-[12px] border border-[#d9d9d9] bg-white px-3 py-2 text-[12px] font-medium text-[#202224]"
          >
            Move down
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
    videoFile,
    handleCoverSelection,
    handleGallerySelection,
    selectExistingGalleryCover,
    removeGalleryFile,
    moveGalleryImage,
    reorderGalleryImages,
    handleDocumentSelection,
    removeDocumentFile,
    handleVideoSelection,
    removeVideoFile,
    mediaValidationError,
  } = useWizard();
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const hasReplacementMedia = coverFile !== null || galleryFiles.length > 0;
  const existingGalleryImageNames =
    isEditing && !hasReplacementMedia ? draft.galleryImageNames : [];
  // When editing without replacement uploads, use the full image refs (r2_key
  // + alt text) so we can render real thumbnails of the preserved photos.
  const existingCoverRef =
    isEditing && !hasReplacementMedia ? draft.coverImageRef : null;
  const existingGalleryRefs = React.useMemo(
    () => (isEditing && !hasReplacementMedia ? draft.galleryImageRefs : []),
    [draft.galleryImageRefs, hasReplacementMedia, isEditing]
  );
  // Map filename -> ref so that if a new listing's data is ever loaded with
  // filenames only, we degrade gracefully.
  const galleryRefByName = React.useMemo(() => {
    const map = new Map<string, ExistingImageRef>();
    existingGalleryRefs.forEach((ref) => map.set(ref.name, ref));
    return map;
  }, [existingGalleryRefs]);
  const uploadedMediaCount = hasReplacementMedia
    ? galleryFiles.length + (draft.coverImageName ? 1 : 0)
    : existingGalleryRefs.length + (existingCoverRef ? 1 : 0);
  const canUseGalleryCover = hasReplacementMedia
    ? galleryFiles.length > 0
    : isEditing && existingGalleryRefs.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Media Uploads</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#767676]">
          Add clean photos and any optional supporting media before the listing is submitted.
        </p>
      </div>

      <div className="space-y-4 rounded-[14px] border border-[#ededed] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="space-y-4">
          {isEditing && !hasReplacementMedia ? (
            <div className="rounded-[12px] border border-[#dbe8ff] bg-[#f6f9ff] px-4 py-3 text-[12px] leading-5 text-[#3157c8]">
              Current listing media is preserved as-is. Choose any existing gallery photo as the new cover, or
              upload a new cover image and gallery set if you want to replace the existing photos.
            </div>
          ) : null}

          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex h-full flex-col">
              <label className={sellerLabelClass}>Cover Image</label>
              <p className="mb-3 min-h-[40px] text-[13px] leading-5 text-[#7b7b7b]">
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
                className="flex min-h-[168px] items-center justify-center rounded-[14px] border-[#d9d9d9] bg-[#faf9f7] p-4"
              />
            </div>

            <div className="flex h-full flex-col">
              <label className={sellerLabelClass}>Upload Media</label>
              <p className="mb-3 min-h-[40px] text-[13px] leading-5 text-[#7b7b7b]">
                PNG or JPG files up to 10MB each. Minimum {MIN_TOTAL_IMAGES} photos in total, up to 100 gallery images.
              </p>
              <Dropzone
                onFilesAdded={handleGallerySelection}
                showFiles={false}
                accept="image/*"
                multiple
                maxSize={MAX_FILE_SIZE_BYTES}
                className="flex min-h-[168px] items-center justify-center rounded-[14px] border-[#d9d9d9] bg-white p-4"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-[18px] font-semibold text-[#202224]">
                  Uploaded media files ({uploadedMediaCount})
                </h3>
                <p className="mt-1 text-[13px] text-[#7b7b7b]">
                  Choose the image that should appear as the cover card on the public listing, then drag or move photos into the display order you want.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isEditing && !hasReplacementMedia) {
                    selectExistingGalleryCover(0);
                    return;
                  }
                  updateField("coverImageName", null);
                  updateField("coverFromGalleryIndex", galleryFiles.length > 0 ? 0 : null);
                }}
                className={sellerGhostButtonClass}
                disabled={!canUseGalleryCover}
              >
                Use gallery cover
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {draft.coverImageName ? (
                existingCoverRef ? (
                  // Editing: show the actual preserved cover image.
                  <ExistingImageCard image={existingCoverRef} badge="Cover" />
                ) : (
                  // Create flow: we only have the local File name until upload.
                  <div className="overflow-hidden rounded-[12px] border border-[#2563eb]/20 bg-[#eef4ff] p-3">
                    <div className="flex h-full min-h-[120px] flex-col justify-between rounded-[10px] border border-dashed border-[#b7cdfd] bg-white/70 p-3">
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
                )
              ) : null}

              {galleryFiles.length === 0 && !draft.coverImageName && existingGalleryImageNames.length === 0 ? (
                <div className="col-span-full rounded-[12px] border border-dashed border-[#d9d9d9] px-4 py-7 text-center text-[13px] text-[#8a8a8a]">
                  No gallery media uploaded yet.
                </div>
              ) : null}

              {existingGalleryImageNames.map((name, index) => {
                const ref = galleryRefByName.get(name);
                if (ref) {
                  return (
                    <ExistingImageCard
                      key={name}
                      image={ref}
                      onSetCover={() => selectExistingGalleryCover(index)}
                    />
                  );
                }
                // Fallback: we somehow have a filename without an r2_key.
                return (
                  <div
                    key={name}
                    className="overflow-hidden rounded-[12px] border border-[#ededed] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex aspect-[1.4/1] items-center justify-center bg-[#f3f4f6] px-4 text-center text-[13px] font-medium text-[#6b7280]">
                      Existing image
                    </div>
                    <div className="p-4">
                      <p className="truncate text-[13px] font-medium text-[#202224]">{name}</p>
                    </div>
                  </div>
                );
              })}

              {galleryFiles.map((file, index) => (
                <GalleryPreview
                  key={`${file.name}-${index}`}
                  file={file}
                  badge={draft.coverFromGalleryIndex === index && !draft.coverImageName ? "Cover" : undefined}
                  onDragStart={() => setDraggedIndex(index)}
                  onDrop={() => {
                    if (draggedIndex === null) return;
                    reorderGalleryImages(draggedIndex, index);
                    setDraggedIndex(null);
                  }}
                  onSetCover={() => {
                    updateField("coverImageName", null);
                    updateField("coverFromGalleryIndex", index);
                  }}
                  onMoveUp={() => moveGalleryImage(index, "up")}
                  onMoveDown={() => moveGalleryImage(index, "down")}
                  onRemove={() => removeGalleryFile(file)}
                />
              ))}
            </div>
          </div>

          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex h-full flex-col">
              <label className={sellerLabelClass}>Video Walkaround (Optional)</label>
              <p className="mb-3 min-h-[40px] text-[13px] leading-5 text-[#7b7b7b]">
                Upload an MP4, WEBM, or MOV file up to 200MB. If you also paste a hosted link, the uploaded file will be used instead.
              </p>
              <Dropzone
                onFilesAdded={handleVideoSelection}
                files={videoFile ? [videoFile] : []}
                onRemove={videoFile ? () => removeVideoFile() : undefined}
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                multiple={false}
                maxSize={MAX_VIDEO_FILE_SIZE_BYTES}
                className="flex min-h-[150px] items-center justify-center rounded-[14px] border-[#d9d9d9] bg-[#faf9f7] p-4"
              />
              {draft.videoUrl && !videoFile ? (
                <p className="mt-3 text-[12px] leading-5 text-[#767676]">
                  Current hosted video: {draft.videoUrl}
                </p>
              ) : null}
            </div>

            <div className="flex h-full flex-col">
              <label className={sellerLabelClass}>Documents (Optional)</label>
              <p className="mb-3 min-h-[40px] text-[13px] leading-5 text-[#7b7b7b]">
                Attach optional inspection records, ownership documents, or PDF support files.
              </p>
              <Dropzone
                onFilesAdded={handleDocumentSelection}
                files={documentFiles}
                onRemove={removeDocumentFile}
                accept="image/*,.pdf"
                multiple
                maxSize={MAX_FILE_SIZE_BYTES}
                className="flex min-h-[150px] items-center justify-center rounded-[14px] border-[#d9d9d9] bg-[#faf9f7] p-4"
              />
            </div>
          </div>

          <div>
            <label className={sellerLabelClass}>Hosted Video URL (Optional)</label>
            <input
              value={draft.videoUrl}
              onChange={(event) => updateField("videoUrl", event.target.value)}
              placeholder="https://..."
              className={sellerInputClass}
            />
            <p className="mt-2 text-[12px] leading-5 text-[#767676]">
              Use this if your walkaround is already hosted elsewhere.
            </p>
          </div>

          {mediaValidationError ? (
            <div className="rounded-[12px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[13px] text-[#d92d20]">
              {mediaValidationError}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
