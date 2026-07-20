import assert from "node:assert/strict";
import { buildRuleVehicleComparisonForTest } from "./vehicle-comparison";
import type { Listing } from "@/lib/types/listing";

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: "listing-1",
    seller_id: "seller-1",
    dealer_id: null,
    status: "active",
    make: "Toyota",
    model: "Harrier",
    year: 2018,
    price: 2450000,
    currency: "KES",
    mileage: 78000,
    body_type: "SUV",
    transmission: "Automatic",
    fuel_type: "Petrol",
    color: "Black",
    condition: "foreign_used",
    seats: 5,
    doors: 5,
    drive_type: "AWD",
    is_featured: false,
    description: "Clean unit with good presentation.",
    features: [],
    metadata: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const result = buildRuleVehicleComparisonForTest([
  listing({ id: "listing-1", year: 2018, make: "Toyota", model: "Harrier", price: 2450000 }),
  listing({ id: "listing-2", year: 2020, make: "Mazda", model: "CX-5", price: 3100000, mileage: 42000 }),
]);

assert.equal(result.provider, "rules");
assert.equal(result.researchMode, "listing_only");
assert.deepEqual(result.sources, []);
assert.match(result.headline, /2018 Toyota Harrier/);
assert.match(result.headline, /2020 Mazda CX-5/);
assert.match(result.summary, /model year/i);
assert.ok(result.bestFor.some((item) => item.title.includes("2020 Mazda CX-5")));
assert.equal(result.modelInsights.length, 2);
assert.ok(result.modelInsights.every((item) => item.title.match(/\d{4}/)));
assert.ok(result.modelInsights.every((item) => item.modelSummary.length > 180));
assert.ok(result.modelInsights.every((item) => item.knownConsiderations.length >= 3));
assert.ok(result.modelInsights.every((item) => item.researchedSpecs.length === 0));
assert.ok(result.modelComparisons.some((item) => item.includes("Model classes differ")));
