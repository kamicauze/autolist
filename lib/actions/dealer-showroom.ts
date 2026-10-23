"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { r2 } from "@/lib/r2";
import { canUpdateDealerPublicProfile } from "@/lib/profile/profile-update";
import { isOwnedShowroomPhotoKey, orderShowroomCover, validateShowroomPhotoSelection } from "@/lib/dealers/showroom-photos";

async function removeUploadedPhotos(keys: string[]) {
  if (!keys.length) return;
  try {
    const result = await r2.send(new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }));
    if (result.Errors?.length) console.error("Unable to remove dealership photos", result.Errors);
  } catch (error) {
    console.error("Unable to remove dealership photos", error);
  }
}

export async function updateMyDealerShowroom(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to update dealership photos." };
  const [{ data: profile }, dealerResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("dealers").select("id, profile_id, status, updated_at, showroom_photo_keys")
      .eq("profile_id", user.id).maybeSingle(),
  ]);
  const dealer = dealerResult.data;
  if (dealerResult.error) return { error: "Dealership photo editing is not available yet. Please try again later." };
  if (!dealer || !canUpdateDealerPublicProfile({ viewerId: user.id, profileRole: profile?.role ?? null, dealer })) {
    return { error: "Only the approved dealership owner can update these photos." };
  }
  let retained: unknown;
  try { retained = JSON.parse(String(formData.get("retainedKeys") || "[]")); }
  catch { return { error: "Refresh the page before updating your dealership photos." }; }
  const incoming = formData.getAll("photos");
  if (incoming.some((value) => !(value instanceof File))) return { error: "Choose valid dealership image files." };
  const files = incoming as File[];
  const current: string[] = dealer.showroom_photo_keys ?? [];
  const validationError = validateShowroomPhotoSelection(retained, current, files, user.id);
  if (validationError) return { error: validationError };
  const coverIndex = Number(formData.get("coverIndex") ?? 0);
  try { orderShowroomCover(Array((retained as string[]).length + files.length).fill(""), coverIndex); }
  catch { return { error: "Choose a valid dealership cover photo." }; }
  if (!process.env.R2_BUCKET_NAME) return { error: "Photo storage is unavailable. Please try again later." };
  const uploaded: string[] = [];
  let persisted = false;
  try {
    for (const file of files) {
      // Decode and re-encode the image to strip metadata and reject disguised or oversized images.
      const image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
        .rotate().resize(1920, 1280, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      const key = `dealers/${user.id}/showroom/${randomUUID()}.webp`;
      uploaded.push(key);
      await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: image, ContentType: "image/webp" }));
    }
    const keys = orderShowroomCover([...retained as string[], ...uploaded], coverIndex);
    const { data: updated, error } = await supabase.from("dealers")
      .update({ showroom_photo_keys: keys })
      .eq("id", dealer.id).eq("profile_id", user.id).eq("status", "APPROVED")
      .eq("updated_at", dealer.updated_at)
      .eq("showroom_photo_keys", `{${current.join(",")}}`).select("id").maybeSingle();
    if (error) throw new Error("Unable to save dealership photos. Please try again.");
    if (!updated) throw new Error("Your dealership profile changed. Refresh the page and try again.");
    persisted = true;
    await removeUploadedPhotos(current.filter((key) => isOwnedShowroomPhotoKey(key, user.id) && !keys.includes(key)));
    revalidatePath(`/dealers/${dealer.id}`);
    revalidatePath("/dashboard/profile");
    return { success: true as const, keys };
  } catch (error) {
    if (!persisted) await removeUploadedPhotos(uploaded);
    console.error("Dealership photo update failed", error);
    return { error: error instanceof Error && error.message.startsWith("Your dealership")
      ? error.message : "Unable to save dealership photos. Check your images and try again." };
  }
}
