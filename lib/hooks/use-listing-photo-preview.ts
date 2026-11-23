"use client";

import { useEffect, useState } from "react";
import { getListingPhotoPreview } from "@/lib/client/listing-photo-preview";

export function useListingPhotoPreview(file: File) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let url: string | null = null;
    void getListingPhotoPreview(file, controller.signal).then((blob) => {
      if (!blob || controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setPreview({ file, url });
    });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  return preview?.file === file ? preview.url : null;
}
