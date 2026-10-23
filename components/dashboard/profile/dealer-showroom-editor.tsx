"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateMyDealerShowroom } from "@/lib/actions/dealer-showroom";
import { MAX_SHOWROOM_PHOTOS, MAX_SHOWROOM_PHOTO_BYTES, SHOWROOM_PHOTO_TYPES } from "@/lib/dealers/showroom-photos";
import { getImageUrl } from "@/lib/utils/listings";

export function DealerShowroomEditor({ initialKeys }: { initialKeys: string[] }) {
  const router = useRouter();
  const [retainedKeys, setRetainedKeys] = useState(initialKeys);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <section className="rounded-[24px] border border-[#ededed] bg-white p-5 lg:p-6" aria-labelledby="showroom-heading">
      <h2 id="showroom-heading" className="text-xl font-semibold text-gray-900">Cover photo and dealership photos</h2>
      <p className="mt-2 text-sm text-gray-600">Show buyers your showroom or forecourt. Choose the cover photo for your public dealer profile header. Add up to five photos, JPG, PNG or WebP, up to 5MB each.</p>
      <form className="mt-5 space-y-4" onSubmit={async (event) => {
        event.preventDefault(); setSaving(true); setError(null); setSuccess(false);
        const data = new FormData();
        data.set("retainedKeys", JSON.stringify(retainedKeys));
        data.set("coverIndex", String(coverIndex));
        files.forEach((file) => data.append("photos", file));
        try {
          const result = await updateMyDealerShowroom(data);
          if ("error" in result) { setError(result.error ?? "Unable to save photos."); return; }
          setRetainedKeys(result.keys); setFiles([]); setCoverIndex(0); setSuccess(true); router.refresh();
        } catch { setError("Unable to save photos. Please try again."); }
        finally { setSaving(false); }
      }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {retainedKeys.map((key, index) => (
            <div key={key} className="space-y-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                <Image src={getImageUrl(key)} alt={`Dealership photo ${index + 1}`} fill sizes="240px" className="object-cover" />
              </div>
              <button type="button" disabled={saving} className="text-sm font-medium text-red-700 underline" aria-label={`Remove dealership photo ${index + 1}`} onClick={() => { setRetainedKeys((keys) => keys.filter((item) => item !== key)); setCoverIndex((current) => current === index ? 0 : current > index ? current - 1 : current); setSuccess(false); }}>Remove</button>
            </div>
          ))}
          {previews.map((url, index) => (
            <div key={url} className="space-y-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                <Image src={url} alt={`New dealership photo ${index + 1}`} fill unoptimized className="object-cover" />
              </div>
              <button type="button" disabled={saving} className="text-sm font-medium text-red-700 underline" aria-label={`Remove new dealership photo ${index + 1}`} onClick={() => { setFiles((current) => current.filter((_, i) => i !== index)); setCoverIndex((current) => current === retainedKeys.length + index ? 0 : current > retainedKeys.length + index ? current - 1 : current); setSuccess(false); }}>Remove</button>
            </div>
          ))}
        </div>
        {retainedKeys.length + files.length > 0 ? (
          <div>
            <label htmlFor="showroom-cover" className="block text-sm font-semibold text-gray-900">Public profile cover photo</label>
            <select id="showroom-cover" value={coverIndex} disabled={saving} onChange={(event) => { setCoverIndex(Number(event.target.value)); setSuccess(false); }} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
              {retainedKeys.map((key, index) => <option key={key} value={index}>Dealership photo {index + 1}</option>)}
              {files.map((file, index) => <option key={index} value={retainedKeys.length + index}>New photo {index + 1}: {file.name}</option>)}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="showroom-photos" className="block text-sm font-semibold text-gray-900">Add dealership photos</label>
          <input id="showroom-photos" type="file" multiple accept={SHOWROOM_PHOTO_TYPES.join(",")} disabled={saving || retainedKeys.length + files.length >= MAX_SHOWROOM_PHOTOS} className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-2" onChange={(event) => {
            const selected = Array.from(event.target.files ?? []); event.target.value = ""; setSuccess(false);
            if (selected.some((file) => !SHOWROOM_PHOTO_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_SHOWROOM_PHOTO_BYTES)) { setError("Each photo must be a JPG, PNG, or WebP image up to 5MB."); return; }
            if (selected.length + files.length + retainedKeys.length > MAX_SHOWROOM_PHOTOS) { setError("Choose up to five dealership photos."); return; }
            setFiles((current) => [...current, ...selected]); setError(null);
          }} />
        </div>
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        {success ? <p role="status" className="text-sm text-green-700">Dealership photos saved. Your public header has been updated.</p> : null}
        <button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving photos..." : "Save dealership photos"}</button>
      </form>
    </section>
  );
}
