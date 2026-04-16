import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { buildListingImageVariantKey, isListingImageKey, type ListingImageVariant } from "@/lib/utils/image-variants";

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "") || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const ALLOWED_VARIANTS = new Set<ListingImageVariant>(["original", "thumb", "card", "hero"]);

function buildPublicUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}

async function objectExists(key: string) {
  if (!R2_BUCKET_NAME) return false;

  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const variant = (request.nextUrl.searchParams.get("variant") || "original") as ListingImageVariant;

  if (!key) {
    return NextResponse.json({ error: "Missing key." }, { status: 400 });
  }

  if (key.startsWith("http")) {
    return NextResponse.redirect(key, 307);
  }

  if (!ALLOWED_VARIANTS.has(variant)) {
    return NextResponse.json({ error: "Invalid variant." }, { status: 400 });
  }

  let resolvedKey = key;

  if (variant !== "original" && isListingImageKey(key)) {
    const variantKey = buildListingImageVariantKey(key, variant);
    if (await objectExists(variantKey)) {
      resolvedKey = variantKey;
    }
  }

  const response = NextResponse.redirect(buildPublicUrl(resolvedKey), 307);
  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return response;
}
