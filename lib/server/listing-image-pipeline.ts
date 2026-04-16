import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "crypto";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { r2 } from "@/lib/r2";
import { buildListingImageVariantKey } from "@/lib/utils/image-variants";

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const IMAGE_VARIANTS = {
  thumb: { width: 360, quality: 68 },
  card: { width: 960, quality: 76 },
  hero: { width: 1600, quality: 82 },
} as const;

const INTERIOR_HINTS = [
  "interior",
  "dashboard",
  "dash",
  "seat",
  "seats",
  "steering",
  "odometer",
  "cluster",
  "console",
  "cabin",
  "boot",
  "trunk",
  "doorpanel",
  "upholstery",
  "int",
];

const EXTERIOR_HINTS = [
  "front",
  "rear",
  "back",
  "side",
  "angle",
  "exterior",
  "outside",
  "body",
];

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

function buildOriginalListingImageKey(listingId: string, fileName: string) {
  return `listings/${listingId}/${Date.now()}-${nanoid(10)}-${sanitizeFileName(fileName)}`;
}

function scoreFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  let score = 0;

  if (INTERIOR_HINTS.some((hint) => lower.includes(hint))) {
    score -= 120;
  }

  if (EXTERIOR_HINTS.some((hint) => lower.includes(hint))) {
    score += 30;
  }

  return score;
}

async function sampleBrightness(bytes: Buffer) {
  const { data, info } = await sharp(bytes)
    .rotate()
    .resize(24, 24, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let total = 0;
  for (let index = 0; index < data.length; index += info.channels) {
    total += data[index] + data[index + 1] + data[index + 2];
  }

  const pixels = data.length / info.channels;
  return pixels > 0 ? total / (pixels * 3) : 128;
}

export async function scoreListingCoverCandidate(fileName: string, bytes: Buffer) {
  const metadata = await sharp(bytes).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const aspectRatio = height > 0 ? width / height : 1;
  const brightness = await sampleBrightness(bytes);

  let score = scoreFileName(fileName);

  if (aspectRatio >= 1.25) score += 30;
  else if (aspectRatio >= 1.05) score += 16;
  else if (aspectRatio < 0.95) score -= 24;

  if (width * height >= 1_400_000) score += 10;
  else if (width * height >= 700_000) score += 5;

  if (brightness >= 90 && brightness <= 210) score += 6;
  if (brightness < 55) score -= 8;

  return score;
}

async function uploadBuffer(key: string, bytes: Buffer, contentType: string) {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 bucket configuration is missing.");
  }

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    })
  );
}

export async function uploadListingImageVariants(originalKey: string, bytes: Buffer) {
  for (const variant of Object.keys(IMAGE_VARIANTS) as Array<keyof typeof IMAGE_VARIANTS>) {
    const config = IMAGE_VARIANTS[variant];
    const variantKey = buildListingImageVariantKey(originalKey, variant);
    const variantBytes = await sharp(bytes)
      .rotate()
      .resize({ width: config.width, withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toBuffer();

    await uploadBuffer(variantKey, variantBytes, "image/webp");
  }
}

export async function uploadListingImageAssets(input: {
  listingId: string;
  fileName: string;
  bytes: Buffer;
  contentType: string;
}) {
  const originalKey = buildOriginalListingImageKey(input.listingId, input.fileName);
  const hash = createHash("sha256").update(input.bytes).digest("hex");
  const coverScore = await scoreListingCoverCandidate(input.fileName, input.bytes);

  await uploadBuffer(originalKey, input.bytes, input.contentType || "application/octet-stream");
  await uploadListingImageVariants(originalKey, input.bytes);

  return {
    key: originalKey,
    hash,
    coverScore,
  };
}
