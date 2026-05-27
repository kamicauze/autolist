
import { r2 } from "@/lib/r2";
import { rankListingImageCandidates } from "@/lib/server/listing-image-ranking";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import fs from "fs";
import nodeCrypto from "crypto";
import path from "path";

// Hardcoded path to images based on user info
const IMAGE_DIR =
    process.env.SEED_IMAGE_DIR ||
    "WhatsApp Chat with Autolist Dev Team";

// Simplified JSON copy to avoid massive file reads, or read full file
import listingsData from "@/listings.json";

export async function GET() {
    // 1. Authenticate (Need Admin or Owner access to insert images for existing listings)
    // We reuse the seed user logic
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const email = "seed@autolist.com";
    const password = "password123";
    const { data: { user } } = await supabase.auth.signInWithPassword({ email, password });

    if (!user) return NextResponse.json({ error: "Auth failed" }, { status: 401 });

    const results = [];
    const BUCKET_NAME = process.env.R2_BUCKET_NAME;

    // 2. Iterate Listings from JSON
    for (const item of listingsData) {
        // Find the listing in DB
        const { data: dbListing } = await supabase
            .from('listings')
            .select('id')
            .eq('make', item.make)
            .eq('model', item.model)
            .eq('year', item.year)
            .eq('price',
                typeof item.price === 'string' && item.price.includes('M') ? parseFloat(item.price.replace('M', '')) * 1000000
                    : typeof item.price === 'string' && item.price.includes('K') ? parseFloat(item.price.replace('K', '')) * 1000
                        : item.price
            )
            .single();

        if (!dbListing) {
            results.push({ make: item.make, model: item.model, error: "Listing not found in DB" });
            continue;
        }

        const images = item.images || [];
        const uploadedImages: Array<{
            key: string;
            hash: string;
            fileName: string;
            originalIndex: number;
            bytes: Buffer;
        }> = [];

        for (const [originalIndex, filename] of images.entries()) {
            const filePath = path.join(IMAGE_DIR, filename);
            if (!fs.existsSync(/* turbopackIgnore: true */ filePath)) {
                // console.warn(`File not found: ${filePath}`);
                continue;
            }

            // Read file buffer
            const fileBuffer = fs.readFileSync(/* turbopackIgnore: true */ filePath);
            const ext = path.extname(filename).substring(1);
            const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";

            // Calculate MD5 for seeding
            const hash = nodeCrypto.createHash('md5').update(fileBuffer).digest('hex');

            // Upload Key: listings/{listingId}/{filename}
            const key = `listings/${dbListing.id}/${filename}`;

            try {
                // Upload to R2
                await r2.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType,
                    Metadata: { hash }
                }));

                uploadedImages.push({
                    key,
                    hash,
                    fileName: filename,
                    originalIndex,
                    bytes: fileBuffer,
                });

            } catch (err: unknown) {
                results.push({
                    make: item.make,
                    file: filename,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        if (uploadedImages.length > 0) {
            const ranked = await rankListingImageCandidates(
                uploadedImages.map((image) => ({
                    fileName: image.fileName,
                    originalIndex: image.originalIndex,
                    bytes: image.bytes,
                }))
            );

            const orderedImages = ranked
                .map((rankedImage) =>
                    uploadedImages.find((image) => image.originalIndex === rankedImage.originalIndex)
                )
                .filter((image): image is (typeof uploadedImages)[number] => Boolean(image));

            const { error: deleteError } = await supabase
                .from("listing_images")
                .delete()
                .eq("listing_id", dbListing.id);

            if (deleteError) {
                results.push({ make: item.make, model: item.model, error: deleteError.message });
                continue;
            }

            for (const [index, image] of orderedImages.entries()) {
                const { error: dbError } = await supabase
                    .from("listing_images")
                    .insert({
                        listing_id: dbListing.id,
                        r2_key: image.key,
                        image_order: index,
                        alt_text: `${item.make} ${item.model} - Photo ${index + 1}`,
                        image_hash: image.hash,
                        is_watermarked: true,
                    });

                if (dbError) {
                    results.push({ make: item.make, file: image.fileName, error: dbError.message });
                }
            }

            results.push({
                make: item.make,
                model: item.model,
                images_count: orderedImages.length,
                primary_image: orderedImages[0]?.fileName ?? null,
            });
            continue;
        }

        results.push({ make: item.make, model: item.model, images_count: 0 });
    }

    return NextResponse.json({ summary: "Image Migration Complete", results });
}
