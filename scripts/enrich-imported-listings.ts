import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "../lib/supabase/admin";
import { inferPrimaryBodyType } from "../lib/utils/body-type";
import { buildListingDetailMetadata, getListingMetadataDetails } from "../lib/utils/listing-details";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type ManifestItem = {
  folderName: string;
  status: "parsed" | "needs_review" | "skip";
  listing: {
    make: string | null;
    model: string | null;
    trim: string | null;
    variant: string | null;
    bodyType: string | null;
    color: string | null;
    year: number | null;
    price: number | null;
    mileage: number | null;
    description: string;
  };
};

type ManifestFile = {
  items: ManifestItem[];
};

function parseArgs(argv: string[]) {
  const options: {
    manifest?: string;
    sellerEmail?: string;
    dryRun?: boolean;
  } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--manifest") {
      options.manifest = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--seller-email") {
      options.sellerEmail = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

async function loadManifest(filePath: string) {
  const absolute = path.resolve(filePath);
  const raw = await fs.readFile(absolute, "utf8");
  return JSON.parse(raw) as ManifestFile;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = options.manifest || "output/car-folder-manifest.market.json";
  const sellerEmail = options.sellerEmail || "seed@autolist.com";
  const dryRun = Boolean(options.dryRun);

  const manifest = await loadManifest(manifestPath);
  const manifestMap = new Map(
    manifest.items.map((item) => [item.folderName.trim().toLowerCase(), item] as const)
  );

  const supabase = createAdminClient();
  const { data: sellerRows, error: sellerError } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", sellerEmail)
    .limit(1);

  if (sellerError) throw sellerError;
  const seller = sellerRows?.[0];
  if (!seller) {
    throw new Error(`Seller not found for ${sellerEmail}`);
  }

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, make, model, year, price, body_type, color, description, metadata")
    .eq("seller_id", seller.id);

  if (listingsError) throw listingsError;

  let updated = 0;
  let skipped = 0;

  for (const listing of listings || []) {
    const metadata = listing.metadata && typeof listing.metadata === "object"
      ? (listing.metadata as Record<string, Json>)
      : {};
    const importMetadata =
      metadata.import && typeof metadata.import === "object"
        ? (metadata.import as Record<string, Json>)
        : null;

    const sourceFolderName =
      typeof importMetadata?.sourceFolderName === "string"
        ? importMetadata.sourceFolderName.trim()
        : null;

    if (!sourceFolderName) {
      skipped += 1;
      continue;
    }

    const manifestItem = manifestMap.get(sourceFolderName.toLowerCase());
    if (!manifestItem) {
      skipped += 1;
      continue;
    }

    const existingDetails = getListingMetadataDetails({ metadata: listing.metadata as Record<string, unknown> | null });
    const nextDetails = buildListingDetailMetadata({
      ...existingDetails,
      make: manifestItem.listing.make ?? listing.make,
      model: manifestItem.listing.model ?? listing.model,
      trim: manifestItem.listing.trim ?? existingDetails.trim,
      variant: manifestItem.listing.variant ?? existingDetails.variant,
      year: manifestItem.listing.year != null ? String(manifestItem.listing.year) : existingDetails.year,
      mileage:
        manifestItem.listing.mileage != null
          ? String(manifestItem.listing.mileage)
          : existingDetails.mileage,
      bodyType:
        manifestItem.listing.bodyType ??
        existingDetails.bodyType ??
        listing.body_type ??
        inferPrimaryBodyType(
          [listing.make, listing.model, sourceFolderName, manifestItem.listing.description]
            .filter(Boolean)
            .join(" ")
        ) ??
        undefined,
      color: manifestItem.listing.color ?? existingDetails.color ?? listing.color ?? undefined,
    });

    const nextMetadata = {
      ...metadata,
      ...(manifestItem.listing.trim ? { trim: manifestItem.listing.trim } : {}),
      ...(manifestItem.listing.variant ? { variant: manifestItem.listing.variant } : {}),
      details: nextDetails,
    };

    const inferredBodyType =
      listing.body_type ||
      manifestItem.listing.bodyType ||
      nextDetails.bodyType ||
      null;

    const patch = {
      body_type: inferredBodyType,
      color: listing.color || manifestItem.listing.color || null,
      description: listing.description || manifestItem.listing.description,
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    };

    if (dryRun) {
      updated += 1;
      continue;
    }

    const { error } = await supabase
      .from("listings")
      .update(patch)
      .eq("id", listing.id);

    if (error) throw error;
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        manifest: manifestPath,
        sellerEmail,
        dryRun,
        updated,
        skipped,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
