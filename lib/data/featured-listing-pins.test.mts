import assert from "node:assert/strict";
import { mock, test } from "node:test";

const listing = (id: string, sale_channel = "standard") => ({
  id,
  seller_id: "seller",
  status: "active",
  sale_channel,
  is_featured: false,
});
let livePins: ReturnType<typeof listing>[] = [];
const getFeaturedListings = mock.fn(async (limit: number) =>
  ["featured-one", "pinned-one", "featured-two", "pinned-two"].slice(0, limit).map((id) => listing(id))
);
function createPinQuery() {
  let listings = livePins;
  const pinQuery = {
    select: () => pinQuery,
    eq: (field: string, value: unknown) => {
      if (field.startsWith("listing.")) {
        const column = field.slice("listing.".length) as keyof ReturnType<typeof listing>;
        listings = listings.filter((row) => row[column] === value);
      }
      return pinQuery;
    },
    in: (field: "listing.sale_channel", channels: string[]) => {
      assert.equal(field, "listing.sale_channel");
      listings = listings.filter((row) => channels.includes(row.sale_channel));
      return pinQuery;
    },
    or: () => pinQuery,
    order: () => pinQuery,
    limit: async (limit: number) => ({
      data: listings.slice(0, limit).map((listing) => ({ listing, status: "active" })),
      error: null,
    }),
  };
  return pinQuery;
}

mock.module("server-only", { namedExports: {} });
mock.module("@/lib/supabase/server", {
  namedExports: { createClient: async () => ({ from: createPinQuery }) },
});
mock.module("@/lib/data/listings", {
  namedExports: {
    getFeaturedListings,
    getActiveSubscriptionPriorityBySellerId: async () => new Map(),
    sortFeaturedListingsBySubscriptionPriority: (listings: unknown[]) => listings,
  },
});

const { getHomepageFeaturedListings } = await import("./featured-listing-pins");

test("fills empty featured slots without duplicating live pins", async () => {
  livePins = ["pinned-one", "pinned-two"].map((id) => listing(id));
  assert.deepEqual((await getHomepageFeaturedListings(4)).map(({ id }) => id), [
    "pinned-one", "pinned-two", "featured-one", "featured-two",
  ]);
});

test("keeps the full pin rotation pool when the tab already has enough pins", async () => {
  livePins = ["pinned-one", "pinned-two", "pinned-three"].map((id) => listing(id));
  getFeaturedListings.mock.resetCalls();
  assert.deepEqual(await getHomepageFeaturedListings(2), livePins);
  assert.equal(getFeaturedListings.mock.callCount(), 0);
});

test("includes public live pins without a separate featured flag and excludes private listings", async () => {
  livePins = [
    listing("public-standard"),
    listing("private-dealer", "dealer_only"),
    listing("public-dealer", "dealer_public"),
  ];
  assert.deepEqual((await getHomepageFeaturedListings(2)).map(({ id }) => id), [
    "public-standard", "public-dealer",
  ]);
});
