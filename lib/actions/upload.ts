
'use server'

import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function getUploadUrl(
    listingId: string,
    fileType: string,
    fileSize: number
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
        return { error: "File too large. Max size is 5MB." };
    }

    // 3. Generate Unique Key
    // Structure: listings/{listingId}/{randomId}.{ext}
    const ext = fileType.split("/")[1];
    const key = `listings/${listingId}/${nanoid()}.${ext}`;

    // 4. Generate URL
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const url = await getSignedUrl(r2, command, { expiresIn: 3600 });
        return { success: true, url, key };
    } catch (err: any) {
        console.error("R2 Presign Error:", err);
        return { error: "Failed to generate upload URL." };
    }
}
