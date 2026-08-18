import assert from "node:assert/strict";
import test from "node:test";
import {
  SELLER_PACKAGE_PLANS,
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
