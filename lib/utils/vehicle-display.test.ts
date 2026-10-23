import assert from "node:assert/strict";
import type { Listing } from "@/lib/types/listing";
import { getListingCardProps } from "./listing-card-props";
import { buildListingCardFacts } from "./listing-card-facts";
import {
  getListingBodyTypeLabel,
  getListingFuelTypeLabel,
  getListingMileageLabel,
  getListingTransmissionLabel,
} from "./vehicle-display";

function makeListing(overrides: Partial<Listing>): Listing {
  return {
    id: "listing-1",
    seller_id: "seller-1",
    dealer_id: null,
    status: "active",
    make: "Mazda",
    model: "CX-8",
    year: 2017,
    price: 3300000,
    currency: "KES",
    mileage: null,
    body_type: null,
    transmission: null,
    fuel_type: null,
    color: null,
    condition: "foreign_used",
    seats: null,
    doors: null,
    drive_type: null,
    is_featured: false,
    description: null,
    features: null,
    metadata: null,
    created_at: "2026-06-18T00:00:00.000Z",
    updated_at: "2026-06-18T00:00:00.000Z",
    ...overrides,
  };
}

{
  const listing = makeListing({
    metadata: {
      details: {
        mileage: "78000",
        engineType: "diesel",
        transmission: "automatic",
        bodyType: "suv",
      },
    },
  });

  assert.equal(getListingMileageLabel(listing), "78,000 km");
  assert.equal(getListingFuelTypeLabel(listing), "Diesel");
  assert.equal(getListingTransmissionLabel(listing), "Automatic");
  assert.equal(getListingBodyTypeLabel(listing), "SUV");
}

{
  const listing = makeListing({
    mileage: 41238,
    fuel_type: "hybrid",
    transmission: "manual",
    body_type: "station_wagon",
    metadata: {
      details: {
        mileage: "78000",
        engineType: "diesel",
        transmission: "automatic",
        bodyType: "suv",
      },
    },
  });

  assert.equal(getListingMileageLabel(listing), "41,238 km");
  assert.equal(getListingFuelTypeLabel(listing), "Hybrid");
  assert.equal(getListingTransmissionLabel(listing), "Manual");
  assert.equal(getListingBodyTypeLabel(listing), "Station Wagon");
}

{
  const listing = makeListing({ metadata: null });

  assert.equal(getListingMileageLabel(listing), "");
  assert.equal(getListingFuelTypeLabel(listing), "");
  assert.equal(getListingTransmissionLabel(listing), "");
  assert.equal(getListingBodyTypeLabel(listing), "Vehicle");
  assert.equal(getListingBodyTypeLabel(listing, ""), "");
}

{
  // Bike transmission uses the same persisted field and card path as other vehicles.
  for (const transmission of ["manual", "automatic", null]) {
    const listing = makeListing({
      make: "Honda",
      model: "CB500X",
      transmission,
      metadata: { category: "motorbike", details: { engineCapacity: "500" } },
    });
    const props = getListingCardProps(listing);
    const fact = buildListingCardFacts(props).find((item) => item.key === "transmission");
    assert.equal(props.transmission, transmission === "manual" ? "Manual" : transmission === "automatic" ? "Automatic" : undefined);
    assert.equal(fact?.value, props.transmission);
  }
}

console.log("vehicle-display label tests passed");
