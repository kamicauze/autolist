import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  fileURLToPath(new URL("./admin-user-activity-live.tsx", import.meta.url)),
  "utf8"
);

assert.match(source, /Account details/);
assert.match(source, /Dealer details/);
assert.match(source, /History index/);
assert.match(source, /Open KYC queue/);
assert.match(
  source,
  /2xl:grid-cols-\[minmax\(0,1\.4fr\)_minmax\(360px,0\.6fr\)\]/
);
assert.match(source, /\[&>section\]:min-w-0/);
assert.doesNotMatch(source, /Fast read/);
assert.doesNotMatch(source, /xl:grid-cols-\[292px_minmax/);
assert.equal(
  source.match(/No activity has been recorded for this account yet\./g)?.length,
  1
);
