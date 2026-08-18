import assert from "node:assert/strict";
import {
  inferMarketplaceRoleFromNextPath,
  isPrivateSellerRole,
  resolveDealerRegistrationPath,
} from "./auth-routing";

assert.equal(resolveDealerRegistrationPath(null), null);
assert.equal(
  resolveDealerRegistrationPath("PENDING"),
  "/dashboard/verification",
);
assert.equal(
  resolveDealerRegistrationPath("REJECTED"),
  "/dashboard/verification",
);
assert.equal(resolveDealerRegistrationPath("APPROVED"), "/dashboard");

assert.equal(inferMarketplaceRoleFromNextPath("/sell/dealer"), "seller");
assert.equal(
  inferMarketplaceRoleFromNextPath("/sell/dealer?source=footer"),
  "seller",
);
assert.equal(
  inferMarketplaceRoleFromNextPath("/dashboard/listings/new"),
  "seller",
);
assert.equal(inferMarketplaceRoleFromNextPath("/register/dealer"), "dealer");
assert.equal(inferMarketplaceRoleFromNextPath("/search"), null);

assert.equal(isPrivateSellerRole("seller"), true);
assert.equal(isPrivateSellerRole("buyer"), false);
assert.equal(isPrivateSellerRole("dealer"), false);
assert.equal(isPrivateSellerRole("sales_agent"), false);
assert.equal(isPrivateSellerRole("support"), false);
assert.equal(isPrivateSellerRole("admin"), false);
assert.equal(isPrivateSellerRole("super_admin"), false);
assert.equal(isPrivateSellerRole(null), false);
