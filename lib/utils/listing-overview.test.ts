import assert from "node:assert/strict";
import test from "node:test";
import type { Listing } from "@/lib/types/listing";
import { buildListingOverviewItems } from "./listing-overview";

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "listing-overview-1",
    seller_id: "seller-1",
    dealer_id: null,
    status: "active",
    make: "Isuzu",
    model: "NPR",
    year: 2022,
    price: 4_650_000,
    currency: "KES",
    mileage: null,
    body_type: null,
    transmission: null,
    fuel_type: null,
    color: null,
    condition: null,
    seats: null,
    doors: null,
    drive_type: null,
    is_featured: false,
    description: null,
    features: null,
    metadata: null,
    created_at: "2026-08-07T00:00:00.000Z",
    updated_at: "2026-08-07T00:00:00.000Z",
    ...overrides,
  };
}

test("overview includes formatted condition, drive type, and full location", () => {
  const items = buildListingOverviewItems(
    makeListing({
      condition: "foreign_used",
      drive_type: "four_wheel_drive",
    }),
    "Industrial Area, Nairobi County"
  );
  const values = Object.fromEntries(items.map((item) => [item.label, item.value]));

  assert.equal(values.Condition, "Foreign used");
  assert.equal(values["Drive type"], "Four Wheel Drive");
  assert.equal(values.Location, "Industrial Area, Nairobi County");
  assert.equal(items.find((item) => item.label === "Condition")?.key, "condition");
  assert.equal(items.find((item) => item.label === "Drive type")?.key, "drive-type");
  assert.equal(items.find((item) => item.label === "Location")?.key, "location");
});

test("overview reads nested wizard metadata and omits empty optional facts", () => {
  const items = buildListingOverviewItems(
    makeListing({
      metadata: {
        details: {
          driveType: "4wd",
          seats: "3",
          doors: "2",
        },
      },
    })
  );
  const values = Object.fromEntries(items.map((item) => [item.label, item.value]));

  assert.equal(values["Drive type"], "4WD");
  assert.equal(values.Seats, "3");
  assert.equal(values.Doors, "2");
  assert.equal(values.Condition, undefined);
});

test("farm and plant overviews replace body type with taxonomy category fields", () => {
  for (const category of ["farm_agricultural", "plant_construction"]) {
    const items = buildListingOverviewItems(
      makeListing({
        body_type: "Tractor",
        metadata: {
          category,
          taxonomyCategory: "Tractors",
          subcategory: "Medium Tractor",
        },
      })
    );
    const values = Object.fromEntries(items.map((item) => [item.label, item.value]));

    assert.equal(values.Category, "Tractors");
    assert.equal(values.Subcategory, "Medium Tractor");
    assert.equal(values["Body Type"], undefined);
    assert.equal(items.find((item) => item.label === "Category")?.key, "category");
    assert.equal(items.find((item) => item.label === "Subcategory")?.key, "subcategory");
  }
});

test("ordinary vehicle overviews use the body-type illustration key", () => {
  const items = buildListingOverviewItems(makeListing({ body_type: "Pickup" }));

  assert.equal(items.find((item) => item.label === "Body Type")?.key, "body-type");
  assert.equal(items.some((item) => item.key === "category"), false);
});
