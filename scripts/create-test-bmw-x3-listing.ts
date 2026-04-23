import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { mergeSeedListingLocationMetadata } from "@/lib/constants/seed-locations";
import { rankListingImageCandidates } from "@/lib/server/listing-image-ranking";
import { uploadListingImageAssets } from "@/lib/server/listing-image-pipeline";

type DealerRow = {
  id: string;
  profile_id: string;
  status: string | null;
};

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: seedProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", "seed@autolist.com")
    .single<{ id: string; email: string }>();

  if (profileError || !seedProfile) {
    throw new Error(profileError?.message || "Seed seller profile not found.");
  }

  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("id, profile_id, status")
    .eq("profile_id", seedProfile.id)
    .maybeSingle<DealerRow>();

  if (dealerError) {
    throw new Error(dealerError.message);
  }

  const price = 3_450_000;

  const { data: existing } = await supabase
    .from("listings")
    .select("id")
    .eq("seller_id", seedProfile.id)
    .eq("make", "BMW")
    .eq("model", "X3")
    .eq("year", 2020)
    .eq("price", price)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existing?.id) {
    await supabase.from("listing_images").delete().eq("listing_id", existing.id);
    await supabase.from("listings").delete().eq("id", existing.id);
  }

  const { data: listing, error: insertError } = await supabase
    .from("listings")
    .insert({
      seller_id: seedProfile.id,
      dealer_id: dealer?.id ?? null,
      status: dealer?.status === "APPROVED" ? "active" : "pending",
      make: "BMW",
      model: "X3",
      year: 2020,
      price,
      currency: "KES",
      mileage: 58000,
      description:
        "Single-owner BMW X3 in clean condition with service history, leather interior, reverse camera, and smooth automatic transmission. Well maintained and ready for viewing in Nairobi.",
      features: ["safe_abs"],
      condition: "locally_used",
      body_type: "suv",
      transmission: "automatic",
      fuel_type: "diesel",
      color: "Alpine White",
      metadata: {
        trim: "M-Sport",
        variant: "M40d",
        ...mergeSeedListingLocationMetadata(null, "BMW:X3:2020:test"),
      },
    })
    .select("id, status")
    .single<{ id: string; status: string }>();

  if (insertError || !listing) {
    throw new Error(insertError?.message || "Failed to create listing.");
  }

  const imagePaths = [
    path.join(process.cwd(), "public/sample-car-1.jpg"),
    path.join(process.cwd(), "public/sample-car-2.jpg"),
    path.join(process.cwd(), "public/sample-car-3.jpg"),
  ];

  const uploadedImages: Array<{
    key: string;
    hash: string;
    fileName: string;
    originalIndex: number;
    bytes: Buffer;
  }> = [];

  for (const [index, imagePath] of imagePaths.entries()) {
    const bytes = await readFile(imagePath);
    const fileName = path.basename(imagePath);
    const { key, hash } = await uploadListingImageAssets({
      listingId: listing.id,
      fileName,
      bytes,
      contentType: "image/jpeg",
    });

    uploadedImages.push({
      key,
      hash,
      fileName,
      originalIndex: index,
      bytes,
    });
  }

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

  for (const [index, image] of orderedImages.entries()) {
    const { error: imageError } = await supabase.from("listing_images").insert({
      listing_id: listing.id,
      r2_key: image.key,
      alt_text: `BMW X3 - Photo ${index + 1}`,
      image_order: index,
      image_hash: image.hash,
    });

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  console.log(
    JSON.stringify(
      {
        listingId: listing.id,
        status: listing.status,
        publicUrl: `/vehicle/${listing.id}`,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
