import assert from "node:assert/strict";
import test from "node:test";
import { toDealerAddress } from "@/lib/location/dealer-address";
import { hasCompleteSellerIdentity, listingPhoneSchema } from "./registration";

test("dealer search fills one address, town and county from a Kenyan result", () => {
  assert.deepEqual(toDealerAddress({
    countrycode: "KE",
    name: "Sample Centre",
    street: "Sample Road",
    housenumber: "15",
    city: "Nairobi",
    state: "Nairobi County",
    district: "Westlands",
  }), {
    address: "Sample Centre, 15 Sample Road",
    town: "Nairobi",
    county: "Nairobi",
    area: "Westlands",
  });
  assert.equal(toDealerAddress({ countrycode: "UG", name: "Sample Centre" }), null);
  assert.equal(toDealerAddress({ countrycode: "KE", name: "Sample Road", state: "Unknown" })?.county, "");
});

test("seller identity requires a passport or both sides of a national ID", () => {
  assert.equal(hasCompleteSellerIdentity(["passport"]), true);
  assert.equal(hasCompleteSellerIdentity(["national_id_front", "national_id_back"]), true);
  assert.equal(hasCompleteSellerIdentity(["national_id_front"]), false);
  assert.equal(hasCompleteSellerIdentity([]), false);
});

test("listing phone normalizes Kenya mobile formats and rejects malformed input", () => {
  assert.equal(listingPhoneSchema.parse("0700 000 001"), "+254700000001");
  assert.equal(listingPhoneSchema.parse("+254 700 000 001"), "+254700000001");
  assert.equal(listingPhoneSchema.safeParse("70000").success, false);
  assert.equal(listingPhoneSchema.safeParse("abc0700000001").success, false);
});
