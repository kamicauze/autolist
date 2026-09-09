import assert from "node:assert/strict";
import test from "node:test";
import {
  SELLER_PACKAGE_FEATURED_PRIORITY,
  SELLER_PACKAGE_PLANS,
  getSellerPackageFeaturedPriority,
  isDealerMembershipAccountRole,
} from "./membership";

test("dealer membership plans match the approved Drive tier source", () => {
  assert.deepEqual(
    SELLER_PACKAGE_PLANS.map(({ id, name, priceKes, listingLimit }) => ({
      id,
      name,
      priceKes,
      listingLimit,
    })),
    [
      { id: "basic", name: "Starter", priceKes: 5_000, listingLimit: 15 },
      {
        id: "professional",
        name: "Professional",
        priceKes: 15_000,
        listingLimit: 80,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceKes: 35_000,
        listingLimit: null,
      },
    ]
  );
});

test("dealer membership access fails closed for private and unknown roles", () => {
  assert.equal(isDealerMembershipAccountRole("dealer"), true);
  assert.equal(isDealerMembershipAccountRole("seller"), false);
  assert.equal(isDealerMembershipAccountRole("buyer"), false);
  assert.equal(isDealerMembershipAccountRole(null), false);
  assert.equal(isDealerMembershipAccountRole(undefined), false);
});

test("featured listing priority follows subscription tier", () => {
  assert.deepEqual(SELLER_PACKAGE_FEATURED_PRIORITY, {
    enterprise: 300,
    professional: 200,
    basic: 100,
  });
  assert.equal(getSellerPackageFeaturedPriority("enterprise"), 300);
  assert.equal(getSellerPackageFeaturedPriority("professional"), 200);
  assert.equal(getSellerPackageFeaturedPriority("basic"), 100);
  assert.equal(getSellerPackageFeaturedPriority("unknown"), 0);
});
