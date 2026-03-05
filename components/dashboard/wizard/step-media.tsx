"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { useWizard, MAX_FILE_SIZE_BYTES, MAX_GALLERY_IMAGES, MIN_TOTAL_IMAGES } from "./wizard-context";

export function StepMedia() {
  const {
    draft,
    updateField,
    coverFile,
    galleryFiles,
    documentFiles,
    handleCoverSelection,
    handleGallerySelection,
    removeGalleryFile,
    moveGalleryImage,
    handleDocumentSelection,
    removeDocumentFile,
    mediaValidationError,
  } = useWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Media Uploads</h2>

      <div className="grid gap-6">
        <div>
          <Label className="mb-2 block">Main Cover Image</Label>
          <Dropzone
            onFilesAdded={handleCoverSelection}
            files={coverFile ? [coverFile] : []}
            onRemove={() => {
              updateField("coverImageName", null);
            }}
            accept="image/*"
            multiple={false}
            maxSize={MAX_FILE_SIZE_BYTES}
            className="h-48"
          />
          <p className="mt-2 text-xs text-muted-foreground">Required. Max 10MB.</p>
        </div>

        <div>
          <Label className="mb-2 block">Gallery Images</Label>
          <Dropzone
            onFilesAdded={handleGallerySelection}
            showFiles={false}
            accept="image/*"
            multiple={true}
            maxSize={MAX_FILE_SIZE_BYTES}
            className="h-32 border-gray-200 bg-gray-50/50"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Minimum {MIN_TOTAL_IMAGES} photos total. Up to {MAX_GALLERY_IMAGES} gallery images.
          </p>
        </div>

        <div>
          <Label className="mb-2 block">Documents (Optional)</Label>
          <Dropzone
            onFilesAdded={handleDocumentSelection}
            files={documentFiles}
            onRemove={removeDocumentFile}
            accept="image/*,.pdf"
            multiple={true}
            maxSize={MAX_FILE_SIZE_BYTES}
            className="h-32"
          />
          <p className="mt-2 text-xs text-muted-foreground">PDF or image files. Max 10MB each.</p>
        </div>
      </div>

      <div>
        <Label htmlFor="listing-video-url">Optional Video Walkaround</Label>
        <Input
          id="listing-video-url"
          placeholder="https://youtube.com/watch?v=..."
          value={draft.videoUrl}
          onChange={(e) => updateField("videoUrl", e.target.value)}
        />
      </div>

      {mediaValidationError && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mediaValidationError}
        </p>
      )}

      <div className="space-y-4 rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Gallery Order & Cover Selection</p>
          <div className="text-sm text-muted-foreground">
            {galleryFiles.length} / {MAX_GALLERY_IMAGES}
          </div>
        </div>

        {galleryFiles.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No gallery images uploaded yet.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-gray-50">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              </div>
              <div className="absolute right-2 top-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  onClick={() => removeGalleryFile(file)}
                >
                  <span className="sr-only">Remove</span>
                  ×
                </Button>
              </div>
              <div className="border-t border-border bg-white p-2">
                <p className="mb-2 truncate text-xs font-medium text-foreground">{file.name}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => moveGalleryImage(index, "up")} disabled={index === 0}>↑</Button>
                    <Button type="button" size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => moveGalleryImage(index, "down")} disabled={index === galleryFiles.length - 1}>↓</Button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={draft.coverFromGalleryIndex === index ? "default" : "secondary"}
                    className="h-7 text-xs"
                    onClick={() => updateField("coverFromGalleryIndex", index)}
                  >
                    {draft.coverFromGalleryIndex === index ? "Cover" : "Set Cover"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
