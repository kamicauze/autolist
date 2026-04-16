import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { promises as fs } from "fs";
import { r2 } from "../lib/r2";
import { rankListingImageCandidates } from "../lib/server/listing-image-ranking";
import { uploadListingImageVariants } from "../lib/server/listing-image-pipeline";
import { createAdminClient } from "../lib/supabase/admin";
import { buildListingImageVariantKey } from "../lib/utils/image-variants";

type ListingImageRow = {
  id: string;
  listing_id: string;
  r2_key: string;
  image_order: number;
};

type ListingRow = {
  id: string;
  metadata: Record<string, unknown> | null;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, ms);

      promise.finally(() => clearTimeout(timeout)).catch(() => clearTimeout(timeout));
    }),
  ]);
}

function parseArgs(argv: string[]) {
  const options: { limit?: number; offset?: number; listingId?: string; dryRun?: boolean } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--limit") {
      options.limit = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (token === "--listing-id") {
      options.listingId = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--offset") {
      options.offset = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

async function streamToBuffer(body: unknown) {
  if (!body) return Buffer.alloc(0);
  if (body instanceof Uint8Array) return Buffer.from(body);
  const chunks: Buffer[] = [];

  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function fetchListingImages(limit?: number, offset?: number, listingId?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("listing_images")
    .select("id, listing_id, r2_key, image_order")
    .not("r2_key", "like", "%/variants/%")
    .order("listing_id", { ascending: true })
    .order("image_order", { ascending: true });

  if (listingId) {
    query = query.eq("listing_id", listingId);
  }
  if (typeof offset === "number" && Number.isFinite(offset) && offset > 0) {
    const upper = typeof limit === "number" && Number.isFinite(limit) ? offset + limit - 1 : offset + 499;
    query = query.range(offset, upper);
  } else if (typeof limit === "number" && Number.isFinite(limit)) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ListingImageRow[];
}

async function hasCardVariant(r2Key: string) {
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: buildListingImageVariantKey(r2Key, "card"),
      }),
      {
        abortSignal: AbortSignal.timeout(15_000),
      }
    );
    return true;
  } catch {
    return false;
  }
}

async function fetchImportedListingIds(listingIds: string[]) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, metadata")
    .in("id", listingIds);

  if (error) throw error;

  return new Map(
    ((data || []) as ListingRow[])
      .filter((listing) => Boolean((listing.metadata as Record<string, unknown> | null)?.import))
      .map((listing) => [listing.id, listing])
  );
}

async function backfill() {
  const options = parseArgs(process.argv.slice(2));
  const supabase = createAdminClient();
  const rows = await fetchListingImages(options.limit, options.offset, options.listingId);
  const importedListingMap = await fetchImportedListingIds([...new Set(rows.map((row) => row.listing_id))]);

  const grouped = new Map<string, ListingImageRow[]>();
  for (const row of rows) {
    const bucket = grouped.get(row.listing_id) || [];
    bucket.push(row);
    grouped.set(row.listing_id, bucket);
  }

  let variantCount = 0;
  let reorderedListings = 0;
  let failedImages = 0;
  let skippedExisting = 0;
  const totalListings = grouped.size;
  let listingIndex = 0;

  for (const [listingId, images] of grouped.entries()) {
    listingIndex += 1;
    console.log(`[${listingIndex}/${totalListings}] ${listingId}: processing ${images.length} image(s)`);
    const scored: Array<{ id: string; score: number; imageOrder: number }> = [];
    const candidates: Array<{ id: string; fileName: string; originalIndex: number; bytes: Buffer; imageOrder: number }> = [];

    for (const image of images) {
      try {
        if (!options.dryRun && (await hasCardVariant(image.r2_key))) {
          skippedExisting += 1;
          const fileName = image.r2_key.split("/").pop() || image.r2_key;
          const object = await r2.send(
            new GetObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: image.r2_key,
            }),
            {
              abortSignal: AbortSignal.timeout(60_000),
            }
          );
          const bytes = await withTimeout(
            streamToBuffer(object.Body),
            60_000,
            `Read ${image.r2_key}`
          );
          candidates.push({ id: image.id, fileName, originalIndex: image.image_order, bytes, imageOrder: image.image_order });
          continue;
        }

        const object = await r2.send(
          new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: image.r2_key,
          }),
          {
            abortSignal: AbortSignal.timeout(60_000),
          }
        );

        const bytes = await withTimeout(
          streamToBuffer(object.Body),
          60_000,
          `Read ${image.r2_key}`
        );
        if (!options.dryRun) {
          await withTimeout(
            uploadListingImageVariants(image.r2_key, bytes),
            90_000,
            `Generate variants for ${image.r2_key}`
          );
        }
        variantCount += 1;

        const fileName = image.r2_key.split("/").pop() || image.r2_key;
        candidates.push({ id: image.id, fileName, originalIndex: image.image_order, bytes, imageOrder: image.image_order });
      } catch (error) {
        failedImages += 1;
        console.warn(
          `[skip] ${image.r2_key}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const ranked = await rankListingImageCandidates(
      candidates.map((candidate) => ({
        fileName: candidate.fileName,
        originalIndex: candidate.originalIndex,
        bytes: candidate.bytes,
      }))
    );

    ranked.forEach((candidate) => {
      const original = candidates.find((entry) => entry.originalIndex === candidate.originalIndex);
      if (!original) return;
      scored.push({ id: original.id, score: candidate.score, imageOrder: original.imageOrder });
    });

    if (!importedListingMap.has(listingId)) {
      continue;
    }

    const nextOrder = scored
      .slice()
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.imageOrder - b.imageOrder;
      });

    const changed = nextOrder.some((image, index) => image.imageOrder !== index);
    if (!changed) continue;

    reorderedListings += 1;
    if (options.dryRun) continue;

    for (const [index, image] of nextOrder.entries()) {
      const { error } = await supabase
        .from("listing_images")
        .update({ image_order: index })
        .eq("id", image.id);
      if (error) throw error;
    }
  }

  await fs.writeFile(
    "output/listing-image-backfill-summary.json",
    JSON.stringify(
      {
        processedImages: rows.length,
        variantCount,
        reorderedListings,
        failedImages,
        skippedExisting,
        offset: options.offset || 0,
        dryRun: Boolean(options.dryRun),
      },
      null,
      2
    )
  );

  console.log(
    JSON.stringify(
      {
        processedImages: rows.length,
        variantCount,
        reorderedListings,
        failedImages,
        skippedExisting,
        offset: options.offset || 0,
        dryRun: Boolean(options.dryRun),
      },
      null,
      2
    )
  );
}

backfill().catch((error) => {
  console.error(error);
  process.exit(1);
});
