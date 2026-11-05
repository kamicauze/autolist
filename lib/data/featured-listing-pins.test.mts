import assert from "node:assert/strict";
import { mock, test } from "node:test";

const listing = (id: string) => ({ id, seller_id: "seller" });
let livePins: ReturnType<typeof listing>[] = [];
const getFeaturedListings = mock.fn(async (limit: number) =>
  ["featured-one", "pinned-one", "featured-two", "pinned-two"].slice(0, limit).map(listing)
);
const pinQuery = {
  select: () => pinQuery,
  eq: () => pinQuery,
  or: () => pinQuery,
  order: () => pinQuery,
  limit: async (limit: number) => ({
    data: livePins.slice(0, limit).map((listing) => ({ listing, status: "active" })),
    error: null,
  }),
};

mock.module("server-only", { namedExports: {} });
mock.module("@/lib/supabase/server", {
  namedExports: { createClient: async () => ({ from: () => pinQuery }) },
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
  livePins = ["pinned-one", "pinned-two"].map(listing);
  assert.deepEqual((await getHomepageFeaturedListings(4)).map(({ id }) => id), [
    "pinned-one", "pinned-two", "featured-one", "featured-two",
  ]);
});

test("keeps the full pin rotation pool when the tab already has enough pins", async () => {
  livePins = ["pinned-one", "pinned-two", "pinned-three"].map(listing);
  getFeaturedListings.mock.resetCalls();
  assert.deepEqual(await getHomepageFeaturedListings(2), livePins);
  assert.equal(getFeaturedListings.mock.callCount(), 0);
});
