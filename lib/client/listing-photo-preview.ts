const PREVIEW_MAX_EDGE = 640;
const previews = new WeakMap<File, Blob>();
let previewQueue: Promise<unknown> = Promise.resolve();

// Keep full-resolution decodes out of the gallery and process only one at a
// time. Several camera photos decoded together can exhaust an iOS tab's memory.
export function getListingPhotoPreview(file: File, signal: AbortSignal): Promise<Blob | null> {
  const preview = previewQueue.then(async () => {
    if (signal.aborted) return null;
    const cached = previews.get(file);
    if (cached) return cached;

    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    let canvas: HTMLCanvasElement | null = null;
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Photo preview could not be decoded."));
        image.src = sourceUrl;
      });
      if (signal.aborted) return null;

      const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas!.toBlob(resolve, file.type === "image/png" ? "image/png" : "image/jpeg", 0.8);
      });
      if (signal.aborted) return null;
      if (blob) previews.set(file, blob);
      return blob;
    } catch {
      // A failed thumbnail must not discard the selected original or trigger a
      // full-size fallback decode. The filename and upload remain available.
      return null;
    } finally {
      image.onload = null;
      image.onerror = null;
      image.src = "";
      URL.revokeObjectURL(sourceUrl);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  });
  previewQueue = preview.catch(() => {});
  return preview;
}
