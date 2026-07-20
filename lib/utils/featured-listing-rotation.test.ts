import assert from "node:assert/strict";
import {
  FEATURED_ROTATION_WINDOW_MS,
  getRotatedFeaturedListings,
  HOMEPAGE_FEATURED_LISTING_LIMIT,
} from "./featured-listing-rotation";

const listings = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
];

assert.deepEqual(
  getRotatedFeaturedListings(listings, 8, 0),
  ["one", "two", "three", "four"],
  "the homepage must never render more than four featured listings",
);

assert.deepEqual(
  getRotatedFeaturedListings(
    listings,
    HOMEPAGE_FEATURED_LISTING_LIMIT,
    FEATURED_ROTATION_WINDOW_MS,
  ),
  ["five", "six", "seven", "eight"],
  "the next eight-hour window should advance through the pin pool",
);

assert.deepEqual(
  getRotatedFeaturedListings(
    ["one", "two"],
    HOMEPAGE_FEATURED_LISTING_LIMIT,
    0,
  ),
  ["one", "two"],
  "small pools should render without duplication",
);
