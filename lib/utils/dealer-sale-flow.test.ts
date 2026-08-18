import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const pageSource = readSource("../../app/sell/dealer/page.tsx");
const formSource = readSource(
  "../../components/seller/dealer-sale-form.tsx",
);
const actionSource = readSource("../actions/dealer-sales.ts");
const dashboardSource = readSource(
  "../../components/dashboard/listings/my-listings.tsx",
);
const migrationSource = readSource(
  "../../supabase/migrations/20260818083202_complete_dealer_sale_flow.sql",
);

assert.match(pageSource, /isPrivateSellerRole\(profile\?\.role\)/);
assert.match(pageSource, /\/login\?next=/);

assert.doesNotMatch(formSource, /sessionStorage/);
assert.match(formSource, /createDealerSaleDraft/);
assert.match(formSource, /prepareListingMediaUploads/);
assert.match(formSource, /uploadFilesToPresignedTargets/);
assert.match(formSource, /finalizeListingImageUploads/);
assert.match(formSource, /completeDealerSaleRequest/);

assert.match(actionSource, /requirePrivateSeller/);
assert.match(actionSource, /\.eq\("seller_id", user\.id\)/);
assert.match(actionSource, /imageCount \?\? 0\) < 5/);
assert.match(actionSource, /\.update\(\{ status: "pending"/);

assert.match(dashboardSource, /Received offers/);
assert.match(dashboardSource, /Available bids/);
assert.match(dashboardSource, /Your bids/);
assert.doesNotMatch(dashboardSource, /Sarah Johnson/);
assert.doesNotMatch(dashboardSource, /sarah\.j@email\.com/);

assert.match(migrationSource, /add column if not exists sale_channel/);
assert.match(migrationSource, /sale_channel <> 'dealer_only'/);
assert.match(migrationSource, /Approved dealers view open dealer sale listings/);
assert.match(migrationSource, /listings\.status = 'pending'/);
assert.match(
  migrationSource,
  /revoke all on function public\.create_listing_offer[\s\S]+from public, anon/,
);
assert.match(
  migrationSource,
  /grant execute on function public\.create_listing_offer[\s\S]+to authenticated/,
);
