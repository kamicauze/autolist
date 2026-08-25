import { createHash } from "crypto";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import {
  buildListingMediaObjectKey,
  buildListingMediaUploadObjectKey,
  isListingMediaUploadKeyForListing,
  type ListingMediaUploadDescriptor,
  type ListingMediaUploadReference,
  type ListingMediaUploadTicket,
} from "@/lib/listing-media-upload";

const PRESIGNED_UPLOAD_TTL_SECONDS = 10 * 60;

function buildDescriptorFingerprint(descriptor: ListingMediaUploadDescriptor) {
  return createHash("sha256")
    .update([
      descriptor.kind,
      descriptor.name.trim(),
      descriptor.size,
      descriptor.contentType,
      descriptor.lastModified,
    ].join("|"))
    .digest("hex")
    .slice(0, 24);
}

export function getFinalListingMediaObjectKey(
  listingId: string,
  descriptor: ListingMediaUploadDescriptor
) {
  return buildListingMediaObjectKey(
    listingId,
    descriptor.kind,
    buildDescriptorFingerprint(descriptor),
    descriptor.name
  );
}

function getR2BucketName() {
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  if (!bucketName) throw new Error("R2 bucket configuration is missing.");
  return bucketName;
}

export async function createListingMediaUploadTicket(
  listingId: string,
  descriptor: ListingMediaUploadDescriptor
): Promise<ListingMediaUploadTicket> {
  const bucketName = getR2BucketName();
  const key = buildListingMediaUploadObjectKey(
    listingId,
    descriptor.kind,
    buildDescriptorFingerprint(descriptor),
    descriptor.name
  );
  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: descriptor.contentType,
    }),
    {
      expiresIn: PRESIGNED_UPLOAD_TTL_SECONDS,
      signableHeaders: new Set(["content-type"]),
    }
  );

  return {
    ...descriptor,
    key,
    uploadUrl,
    expiresAt: new Date(Date.now() + PRESIGNED_UPLOAD_TTL_SECONDS * 1000).toISOString(),
  };
}

function normalizeContentType(contentType: string | undefined) {
  return contentType?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}

export async function inspectListingMediaUpload(
  listingId: string,
  upload: ListingMediaUploadReference
) {
  if (!isListingMediaUploadKeyForListing(upload.key, listingId, upload.kind)) {
    throw new Error("Uploaded media does not belong to this listing.");
  }

  const result = await r2.send(
    new HeadObjectCommand({
      Bucket: getR2BucketName(),
      Key: upload.key,
    })
  );
  const contentLength = result.ContentLength ?? -1;
  if (contentLength !== upload.size) {
    throw new Error(`"${upload.name}" did not upload completely. Please try again.`);
  }
  if (normalizeContentType(result.ContentType) !== normalizeContentType(upload.contentType)) {
    throw new Error(`"${upload.name}" has an unexpected file type.`);
  }

  return result;
}

export async function readListingMediaUpload(
  listingId: string,
  upload: ListingMediaUploadReference
) {
  await inspectListingMediaUpload(listingId, upload);
  const result = await r2.send(
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: upload.key,
    })
  );
  if (!result.Body) throw new Error(`Unable to read "${upload.name}" from storage.`);
  const bytes = Buffer.from(await result.Body.transformToByteArray());
  if (bytes.length !== upload.size) {
    throw new Error(`"${upload.name}" changed during upload finalization. Please try again.`);
  }
  return bytes;
}

export async function promoteListingMediaUpload(
  listingId: string,
  upload: ListingMediaUploadReference
) {
  await inspectListingMediaUpload(listingId, upload);
  const bucketName = getR2BucketName();
  const finalKey = getFinalListingMediaObjectKey(listingId, upload);

  await r2.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${upload.key}`,
      Key: finalKey,
      ContentType: upload.contentType,
      MetadataDirective: "REPLACE",
    })
  );
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: upload.key,
    })
  );

  return { ...upload, key: finalKey };
}
