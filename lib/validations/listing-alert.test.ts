import assert from "node:assert/strict";
import test from "node:test";
import { LISTING_ALERT_CATEGORY_CONFIG } from "@/lib/constants/listing-alerts";
import { LISTING_CATEGORY_OPTIONS } from "@/lib/constants/marketplace";
import { listingAlertInputSchema } from "./listing-alert";

function validInput(category: (typeof LISTING_CATEGORY_OPTIONS)[number]["value"]) {
  const [primary, secondary] = LISTING_ALERT_CATEGORY_CONFIG[category].fields;
  return {
    category,
    make: " Example ",
    model: " Model ",
    location: " Nairobi ",
    minYear: "2020",
    maxYear: "2025",
    minPrice: "1000000",
    maxPrice: "3000000",
    primaryValue: primary.options[1]?.value || "any",
    secondaryValue: secondary.options[1]?.value || "any",
    emailEnabled: true,
    priceDropEnabled: true,
  };
}

test("accepts and normalizes configured criteria for all marketplace categories", () => {
  for (const { value: category } of LISTING_CATEGORY_OPTIONS) {
    const parsed = listingAlertInputSchema.parse(validInput(category));
    assert.equal(parsed.category, category);
    assert.equal(parsed.make, "Example");
    assert.equal(parsed.model, "Model");
    assert.equal(parsed.location, "Nairobi");
    assert.equal(parsed.minYear, 2020);
    assert.equal(parsed.maxYear, 2025);
  }
});

test("rejects a criterion that does not belong to the selected category", () => {
  const parsed = listingAlertInputSchema.safeParse({
    ...validInput("car"),
    primaryValue: "not-a-car-body-type",
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.deepEqual(parsed.error.issues[0]?.path, ["primaryValue"]);
  }
});

test("rejects an inverted year range", () => {
  const parsed = listingAlertInputSchema.safeParse({
    ...validInput("truck"),
    minYear: 2025,
    maxYear: 2020,
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.deepEqual(parsed.error.issues[0]?.path, ["maxYear"]);
  }
});


test("normalizes open and exact price bounds and rejects inverted or invalid prices", () => {
  const input = validInput("car");
  for (const [minPrice, maxPrice, expected] of [
    ["", "", [undefined, undefined]],
    ["100000", "", [100000, undefined]],
    ["", "500000", [undefined, 500000]],
    ["1498500", "1498500", [1498500, 1498500]],
  ] as const) {
    const parsed = listingAlertInputSchema.parse({ ...input, minPrice, maxPrice });
    assert.deepEqual([parsed.minPrice, parsed.maxPrice], expected);
  }
  for (const [minPrice, maxPrice] of [["500000", "100000"], ["-1", ""], ["1.5", ""], ["invalid", ""]]) {
    assert.equal(listingAlertInputSchema.safeParse({ ...input, minPrice, maxPrice }).success, false);
  }
});
