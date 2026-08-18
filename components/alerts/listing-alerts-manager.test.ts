import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./listing-alerts-manager.tsx", import.meta.url),
  "utf8"
);

test("saved listing alerts expose the complete account management lifecycle", () => {
  assert.match(source, /createListingAlert/);
  assert.match(source, /updateListingAlert/);
  assert.match(source, /setListingAlertStatus/);
  assert.match(source, /deleteListingAlert/);
  assert.match(source, /Create Alert/);
  assert.match(source, /Pause/);
  assert.match(source, /Resume/);
  assert.match(source, /Delete/);
});

test("alert delivery copy reflects implemented channels only", () => {
  assert.match(source, /In-app alerts are always on/);
  assert.match(source, /Email notifications/);
  assert.doesNotMatch(source, /Push notifications/i);
});
