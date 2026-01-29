
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime"; // You might need to install 'mime' or just guess from extension

// Hardcoded path to images based on user info
const IMAGE_DIR = "/home/kamicauze/Autolist/WhatsApp Chat with Autolist Dev Team";

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
        let order = 0;

        for (const filename of images) {
            const filePath = path.join(IMAGE_DIR, filename);
            if (!fs.existsSync(filePath)) {
                // console.warn(`File not found: ${filePath}`);
                continue;
            }

            // Read file buffer
            const fileBuffer = fs.readFileSync(filePath);
            const ext = path.extname(filename).substring(1);
            const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";

            // Upload Key: listings/{listingId}/{filename}
            const key = `listings/${dbListing.id}/${filename}`;

            try {
                // Upload to R2
                await r2.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType
                }));

                // Insert into DB (using same client)
                const { error: dbError } = await supabase
                    .from('listing_images')
                    .insert({
                        listing_id: dbListing.id,
                        r2_key: key,
                        image_order: order++,
                        alt_text: `${item.make} ${item.model} - ${order}`
                    });

                if (dbError) throw dbError;

            } catch (err: any) {
                results.push({ make: item.make, file: filename, error: err.message });
            }
        }
        results.push({ make: item.make, model: item.model, images_count: order });
    }

    return NextResponse.json({ summary: "Image Migration Complete", results });
}
