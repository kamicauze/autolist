import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./membership-page.tsx", import.meta.url), "utf8");

test("private sellers do not receive dealer pricing or activation controls", () => {
  assert.match(source, /audience === "private_seller"/);
  assert.match(source, /Dealer membership prices do not apply to your account/);
  assert.match(source, /Paid private-seller visibility upgrades are not active/);
});

test("the free pilot offers listing access without package purchase controls", () => {
  assert.match(source, /Dealer listings are free during the pilot/);
  assert.match(source, /No purchase is needed during the pilot/);
  assert.doesNotMatch(source, /activateSellerPackagePlan|handlePlanSelection|Choose Plan|Switch Plan/);
  assert.match(source, /dashboardData\.paymentHistory\.map/);
});

test("an unknown account audience does not fall through to dealer pricing", () => {
  assert.match(source, /if \(audience === null\)/);
  assert.match(source, /Membership options could not be matched to this account/);
});
