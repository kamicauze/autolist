import assert from "node:assert/strict";
import { VEHICLE_TYPE_NAVIGATION_ITEMS } from "./vehicle-type-navigation";

for (const item of VEHICLE_TYPE_NAVIGATION_ITEMS) {
  const href = new URL(item.href, "https://example.test");

  assert.equal(
    href.searchParams.get("category"),
    item.category,
    `${item.name} should filter by its saved listing category`,
  );
  assert.equal(
    href.searchParams.has("q"),
    false,
    `${item.name} should not require the listing text to repeat its category`,
  );
}
