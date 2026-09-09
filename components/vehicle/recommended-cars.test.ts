import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./recommended-cars.tsx", import.meta.url),
  "utf8",
);

test("the optional favorites default has stable identity across renders", () => {
  assert.match(
    source,
    /const EMPTY_FAVORITE_LISTING_IDS: string\[\] = \[\];/,
  );
  assert.match(
    source,
    /favoriteListingIds = EMPTY_FAVORITE_LISTING_IDS/,
  );
  assert.doesNotMatch(source, /favoriteListingIds = \[\]/);
});
