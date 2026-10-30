import assert from "node:assert/strict";
import { test } from "node:test";
const { activateSellerPackagePlan } = await import("./membership");

test("package activation cannot create charges or entitlements during the free pilot", async () => {
  for (const plan of ["basic", "professional", "enterprise"] as const) {
    const result = await activateSellerPackagePlan(plan);
    assert.match(result.error, /Paid packages are unavailable during the free pilot/);
    assert.equal("success" in result, false);
  }
});
