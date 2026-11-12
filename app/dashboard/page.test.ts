import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("the listing card does not show zero capacity when no package is needed", () => {
  assert.doesNotMatch(pageSource, /0\/0 remaining/);
  assert.doesNotMatch(pageSource, /"No active package"/);
  assert.match(pageSource, /const quotaValue = !activePackage\s*\? "Free"/);
  assert.match(pageSource, /"No package needed during the pilot"/);
});
