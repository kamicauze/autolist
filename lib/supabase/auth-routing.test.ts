import assert from "node:assert/strict";
import test from "node:test";
import {
  canRenderBuyerAccountPage,
  inferMarketplaceRoleFromNextPath,
  isPrivateSellerRole,
  privateSellerSetupPath,
  privateSellerSetupDestination,
  resolveDealerRegistrationPath,
  resolveSelfServiceRoleTransition,
  sanitizeNextPath,
} from "./auth-routing";

assert.equal(resolveDealerRegistrationPath(null), null);
assert.equal(resolveDealerRegistrationPath("INCOMPLETE"), "/dashboard");
assert.equal(
  resolveDealerRegistrationPath("PENDING"),
  "/dashboard",
);
assert.equal(
  resolveDealerRegistrationPath("REJECTED"),
  "/dashboard",
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

assert.equal(
  resolveSelfServiceRoleTransition("buyer", "/dashboard/listings/new"),
  "seller",
);
assert.equal(
  resolveSelfServiceRoleTransition("buyer", "/sell/dealer?source=header"),
  "seller",
);
assert.equal(
  resolveSelfServiceRoleTransition("buyer", "https://example.com/dashboard/listings/new"),
  null,
);
assert.equal(
  resolveSelfServiceRoleTransition("seller", "/dashboard/listings/new"),
  null,
);
assert.equal(
  resolveSelfServiceRoleTransition("dealer", "/dashboard/listings/new"),
  null,
);
assert.equal(resolveSelfServiceRoleTransition("buyer", "/dashboard"), null);

assert.equal(isPrivateSellerRole("seller"), true);
assert.equal(isPrivateSellerRole("buyer"), false);
assert.equal(isPrivateSellerRole("dealer"), false);
assert.equal(isPrivateSellerRole("sales_agent"), false);
assert.equal(isPrivateSellerRole("support"), false);
assert.equal(isPrivateSellerRole("admin"), false);
assert.equal(isPrivateSellerRole("super_admin"), false);
assert.equal(isPrivateSellerRole(null), false);

assert.equal(sanitizeNextPath("/\\example.net", ""), "");
assert.equal(sanitizeNextPath("/\n/example.net", ""), "");
assert.equal(sanitizeNextPath("//example.net", ""), "");
assert.equal(sanitizeNextPath("https://example.net", ""), "");
assert.equal(sanitizeNextPath("/sell/dealer?draft=1", ""), "/sell/dealer?draft=1");

test("buyers can open their exact profile and favorites routes, including query strings", () => {
  for (const path of [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/profile?source=account-menu",
    "/dashboard/favorites",
    "/dashboard/favorites?sort=newest",
  ]) {
    assert.equal(canRenderBuyerAccountPage("buyer", "/", path), true, path);
  }
});

test("the buyer account exception does not open other dashboard or nested profile routes", () => {
  for (const path of [
    "/dashboard/profile/security",
    "/dashboard/profile-edit",
    "/dashboard/change-password",
    "/dashboard/listings/new",
    "/dashboard/verification",
    "/dashboard/membership",
    "/admin/dashboard",
    "//example.com/dashboard/profile",
    "/dashboard/profile%2fsecurity",
  ]) {
    assert.equal(canRenderBuyerAccountPage("buyer", "/", path), false, path);
  }
});

test("buyer account pages preserve account-state redirects and other roles' routing", () => {
  for (const path of ["/dashboard", "/dashboard/profile", "/dashboard/favorites"]) {
    for (const destination of ["/account-deactivated", "/register/onboarding", "/admin/dashboard", "/dashboard/verification"]) {
      assert.equal(canRenderBuyerAccountPage("buyer", destination, path), false);
    }
    for (const role of ["seller", "dealer", "sales_agent", "support", "admin", "super_admin", null]) {
      assert.equal(canRenderBuyerAccountPage(role, "/", path), false);
    }
  }
});

test("seller setup keeps listing and dealer-offer destinations on Autolist", () => {
  assert.equal(privateSellerSetupPath(), "/register/onboarding?role=seller");
  assert.equal(
    privateSellerSetupPath("/sell/dealer?source=header"),
    "/register/onboarding?role=seller&next=%2Fsell%2Fdealer%3Fsource%3Dheader",
  );
  assert.equal(privateSellerSetupDestination("//external.test"), "/dashboard/listings/new");
  assert.equal(privateSellerSetupDestination("/admin"), "/dashboard/listings/new");
});
