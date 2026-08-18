import assert from "node:assert/strict";
import test from "node:test";
import type { ListingCategory } from "@/lib/constants/marketplace";
import type { ListingAlertCriteria } from "@/lib/types/listing-alerts";
import {
  buildListingAlertCriteria,
  getListingAlertPriceBounds,
  listingMatchesAlert,
  type ListingAlertMatchableListing,
  type MatchableListingAlert,
} from "./listing-alerts";

function makeListing(
  category: ListingCategory,
  overrides: Partial<ListingAlertMatchableListing> = {}
): ListingAlertMatchableListing {
  return {
    id: "listing-1",
    status: "active",
    sale_channel: "standard",
    make: "Toyota",
    model: "Example",
    year: 2022,
    price: 2_000_000,
    body_type: "SUV",
    fuel_type: "Hybrid",
    seats: 5,
    description: null,
    metadata: { category, cityTown: "Nairobi" },
    ...overrides,
  };
}

function makeAlert(
  category: ListingCategory,
  criteria: ListingAlertCriteria = {},
  overrides: Partial<MatchableListingAlert> = {}
): MatchableListingAlert {
  return {
    id: "alert-1",
    userId: "user-1",
    category,
    make: null,
    model: null,
    location: null,
    minYear: null,
    maxYear: null,
    minPrice: null,
    maxPrice: null,
    criteria,
    emailEnabled: true,
    priceDropEnabled: true,
    ...overrides,
  };
}

test("matches category-specific criteria across all marketplace categories", () => {
  const cases: Array<{
    category: ListingCategory;
    listing: Partial<ListingAlertMatchableListing>;
    criteria: ListingAlertCriteria;
  }> = [
    { category: "car", listing: { body_type: "SUV" }, criteria: { bodyType: "SUV" } },
    { category: "van", listing: { body_type: "Panel Van", seats: 2 }, criteria: { bodyType: "panel_van", seats: 2 } },
    { category: "motorbike", listing: { body_type: "Adventure", metadata: { category: "motorbike", engineCapacity: 650 } }, criteria: { bodyType: "Adventure", engineCc: "600-700" } },
    { category: "truck", listing: { metadata: { category: "truck", taxonomyCategory: "Rigid Trucks", axleConfig: "6x4" } }, criteria: { taxonomyCategory: "Rigid Trucks", axleConfig: "6x4" } },
    { category: "plant_construction", listing: { model: "Excavator", metadata: { category: "plant_construction", taxonomyCategory: "Excavators", hours_used: 1200 } }, criteria: { equipmentType: "excavators", hoursMax: 1500 } },
    { category: "farm_agricultural", listing: { model: "Tractor", metadata: { category: "farm_agricultural", taxonomyCategory: "Tractors", hours_used: 800 } }, criteria: { equipmentType: "tractors", hoursMax: 1000 } },
  ];

  for (const item of cases) {
    assert.equal(
      listingMatchesAlert(
        makeListing(item.category, item.listing),
        makeAlert(item.category, item.criteria),
        "new_listing"
      ),
      true,
      `${item.category} should match its category-specific criteria`
    );
  }
});

test("applies common category, location, year, and price boundaries", () => {
  const listing = makeListing("car");
  const { minPrice, maxPrice } = getListingAlertPriceBounds("1m-3m");
  const alert = makeAlert("car", {}, {
    make: "Toy",
    model: "Exam",
    location: "Nairobi",
    minYear: 2020,
    maxYear: 2024,
    minPrice,
    maxPrice,
  });

  assert.equal(listingMatchesAlert(listing, alert, "new_listing"), true);
  assert.equal(
    listingMatchesAlert({ ...listing, price: 3_500_000 }, alert, "new_listing"),
    false
  );
  assert.equal(
    listingMatchesAlert(
      { ...listing, metadata: { category: "truck", cityTown: "Nairobi" } },
      alert,
      "new_listing"
    ),
    false
  );
});

test("price-drop matches require opt-in and dealer-only listings never match", () => {
  const listing = makeListing("car");
  assert.equal(
    listingMatchesAlert(listing, makeAlert("car", {}, { priceDropEnabled: false }), "price_drop"),
    false
  );
  assert.equal(
    listingMatchesAlert({ ...listing, sale_channel: "dealer_only" }, makeAlert("car"), "new_listing"),
    false
  );
});

test("criteria builder accepts only configured values", () => {
  assert.deepEqual(buildListingAlertCriteria("truck", "Rigid Trucks", "6x4"), {
    taxonomyCategory: "Rigid Trucks",
    axleConfig: "6x4",
  });
  assert.deepEqual(buildListingAlertCriteria("truck", "not-a-real-type", "any"), {});
});

test("missing listing values do not satisfy text criteria", () => {
  const listing = makeListing("car", {
    body_type: null,
    fuel_type: null,
    metadata: { category: "car" },
  });

  assert.equal(
    listingMatchesAlert(
      listing,
      makeAlert("car", { bodyType: "SUV", fuelType: "Diesel" }),
      "new_listing"
    ),
    false
  );
});
