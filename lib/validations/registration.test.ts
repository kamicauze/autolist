import assert from "node:assert/strict";
import test from "node:test";
import { toDealerAddress } from "@/lib/location/dealer-address";
import { LISTING_PHONE_ERROR } from "@/lib/utils/phone";
import {
  DEALERSHIP_NAME_ERROR,
  dealerRegistrationSchema,
  hasCompleteSellerIdentity,
  listingPhoneSchema,
} from "./registration";

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

test("listing phone corrects or rejects the numbers accepted on staging", () => {
  assert.equal(listingPhoneSchema.parse("+2540712345678"), "+254712345678");
  assert.equal(listingPhoneSchema.parse("254 0712345678"), "+254712345678");
  assert.equal(listingPhoneSchema.parse("+1 415 555 0132"), "+14155550132");
  for (const phone of ["071234567", "07123456789", "12345678", "00000000", ""]) {
    const result = listingPhoneSchema.safeParse(phone);
    assert.equal(result.success, false, phone);
    assert.deepEqual(result.error?.issues.map((issue) => issue.message), [LISTING_PHONE_ERROR], phone);
  }
});

test("dealership names reject markup, control characters and emoji but keep business punctuation", () => {
  const name = dealerRegistrationSchema.shape.name;
  for (const value of ["  QA Signup Motors <b>Ltd</b> 🚗  ", "Sample Motors 🚗", "Sample Motors 🇰🇪", "Sample <Motors>", "Sample\tMotors", "Sample\u0007Motors"]) {
    const result = name.safeParse(value);
    assert.equal(result.success, false, value);
    assert.deepEqual(result.error?.issues.map((issue) => issue.message), [DEALERSHIP_NAME_ERROR], value);
  }
  assert.equal(name.parse("  Mwangi & Sons (Kenya) Ltd.  "), "Mwangi & Sons (Kenya) Ltd.");
  assert.equal(name.parse("O'Brien Autos, Nairobi-West"), "O'Brien Autos, Nairobi-West");
  assert.equal(name.parse("Société Générale Motors 2024"), "Société Générale Motors 2024");
  assert.equal(name.parse("Sample Motors® Kenya™"), "Sample Motors® Kenya™");
  assert.deepEqual(name.safeParse("   ").error?.issues.map((issue) => issue.message), ["Dealership name is required."]);
});
