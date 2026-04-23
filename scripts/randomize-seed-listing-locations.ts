import { createAdminClient } from "../lib/supabase/admin";
import { mergeSeedListingLocationMetadata } from "../lib/constants/seed-locations";

type ListingRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  metadata: Record<string, unknown> | null;
};

function parseArgs(argv: string[]) {
  const options: {
    sellerEmail?: string;
    listingId?: string;
    dryRun?: boolean;
  } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--seller-email") {
      options.sellerEmail = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--listing-id") {
      options.listingId = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const supabase = createAdminClient();
  const sellerEmail = options.sellerEmail || "seed@autolist.com";

  let sellerId: string | null = null;
  if (!options.listingId) {
    const { data: seller, error: sellerError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", sellerEmail)
      .single<{ id: string }>();

    if (sellerError || !seller) {
      throw new Error(sellerError?.message || `Seller not found for ${sellerEmail}`);
    }

    sellerId = seller.id;
  }

  let query = supabase
    .from("listings")
    .select("id, make, model, year, price, metadata");

  if (options.listingId) {
    query = query.eq("id", options.listingId);
  } else if (sellerId) {
    query = query.eq("seller_id", sellerId);
  }

  const { data: listings, error: listingsError } = await query.order("created_at", { ascending: true });
  if (listingsError) throw listingsError;

  let updated = 0;
  for (const listing of (listings || []) as ListingRow[]) {
    const metadata = mergeSeedListingLocationMetadata(
      listing.metadata,
      `${listing.id}:${listing.make}:${listing.model}:${listing.year}:${listing.price}`
    );

    if (!options.dryRun) {
      const { error } = await supabase
        .from("listings")
        .update({
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", listing.id);

      if (error) throw error;
    }

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        sellerEmail,
        listingId: options.listingId || null,
        dryRun: Boolean(options.dryRun),
        updated,
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
