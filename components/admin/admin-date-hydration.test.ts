import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const DATE_SURFACES = [
  "components/admin/admin-dashboard-live.tsx",
  "components/admin/admin-user-activity-live.tsx",
  "components/admin/admin-blogs-content-live.tsx",
];

for (const filePath of DATE_SURFACES) {
  test(`${filePath} formats hydrated dates in a deterministic timezone`, () => {
    const source = fs.readFileSync(path.join(process.cwd(), filePath), "utf8");
    const localeDateCalls = source.match(/toLocaleString\("en-KE",\s*\{[\s\S]*?\}\)/g) ?? [];

    assert.ok(localeDateCalls.length > 0, "expected at least one localized date-time formatter");
    for (const call of localeDateCalls) {
      assert.match(call, /timeZone:\s*"Africa\/Nairobi"/);
    }
  });
}
