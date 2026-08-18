import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./membership-page.tsx", import.meta.url), "utf8");

test("private sellers do not receive dealer pricing or activation controls", () => {
  assert.match(source, /audience === "private_seller"/);
  assert.match(source, /Dealer membership prices do not apply to your account/);
  assert.match(source, /Paid private-seller visibility upgrades are not active/);
  assert.match(source, /const canManagePlans = audience === "dealer"/);
  assert.match(source, /disabled={!canManagePlans \|\| isLoading \|\| isPending \|\| isActive}/);
});

test("an unknown account audience does not fall through to dealer pricing", () => {
  assert.match(source, /if \(audience === null\)/);
  assert.match(source, /Membership options could not be matched to this account/);
});
