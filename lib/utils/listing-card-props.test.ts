import assert from "node:assert/strict";
import test from "node:test";
import type { Listing } from "@/lib/types/listing";
import { getListingCardProps } from "./listing-card-props";

function buildListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "listing-1",
    make: "Toyota",
    model: "Prado",
    year: 2019,
    price: 6_500_000,
    currency: "KES",
    is_featured: false,
    images: [],
    ...overrides,
  } as Listing;
}

test("dealer listings show the dealership name and a call action", () => {
  const props = getListingCardProps(
    buildListing({
      dealer: { id: "dealer-1", name: "Westlands Motors", logo_url: "/logo.png" },
    } as Partial<Listing>),
  );

  assert.equal(props.sellerLabel, "Dealer: Westlands Motors");
  assert.equal(props.contactKind, "call");
  assert.equal(props.seller.name, "Westlands Motors");
  assert.equal(props.seller.avatarUrl, "/logo.png");
  assert.equal(props.href, "/vehicle/listing-1");
});

test("private listings show a private seller label and a message action", () => {
  const props = getListingCardProps(buildListing());

  assert.equal(props.sellerLabel, "Private seller");
  assert.equal(props.contactKind, "message");
  assert.deepEqual(props.images, ["/placeholder-car.jpg"]);
});

test("images are ordered by image_order without mutating the listing", () => {
  const images = [
    { r2_key: "second.jpg", image_order: 1 },
    { r2_key: "first.jpg", image_order: 0 },
  ] as Listing["images"];
  const props = getListingCardProps(buildListing({ images }));

  assert.equal(props.images.length, 2);
  assert.match(props.images[0], /first/);
  assert.match(props.images[1], /second/);
  assert.equal(images?.[0].r2_key, "second.jpg");
});
