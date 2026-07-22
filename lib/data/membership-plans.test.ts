import assert from "node:assert/strict";
import test from "node:test";
import { SELLER_PACKAGE_PLANS } from "./membership";

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
