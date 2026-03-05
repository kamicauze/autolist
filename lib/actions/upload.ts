
'use server'

import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB — matches wizard MAX_FILE_SIZE_BYTES

export async function getUploadUrl(
    listingId: string,
    fileType: string,
    fileSize: number,
    fileHash?: string // MD5 hash from client
) {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 2. Validation
    if (!ALLOWED_TYPES.includes(fileType)) {
        return { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." };
    }
    if (fileSize > MAX_SIZE) {
        return { error: "File too large. Max size is 10MB." };
    }

    // 3. Duplicate Image Check (MVP)
    // Prevent same seller from uploading the exact same image twice across any of their listings
    if (fileHash) {
        const { data: existingImage } = await supabase
            .from('listing_images')
            .select('id, listings!inner(seller_id)')
            .eq('image_hash', fileHash)
            .eq('listings.seller_id', user.id) // Check against all listings by this seller
            .limit(1)
            .single();

        if (existingImage) {
            return { error: "Duplicate image detected. You have already uploaded this photo." };
        }
    }

    // 4. Generate Unique Key
    // Structure: listings/{listingId}/{randomId}.{ext}
    const ext = fileType.split("/")[1];
    const key = `listings/${listingId}/${nanoid()}.${ext}`;

    // 5. Generate URL
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
            Metadata: fileHash ? { 'hash': fileHash } : undefined // Store hash in R2 metadata too
        });

        const url = await getSignedUrl(r2, command, { expiresIn: 3600 });
        return { success: true, url, key };
    } catch (err: any) {
        console.error("R2 Presign Error:", err);
        return { error: "Failed to generate upload URL." };
    }
}
