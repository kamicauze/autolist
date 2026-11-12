import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidPhoneNumber,
  normalizeListingPhone,
  normalizePhoneForVerification,
  normalizePhoneInput,
} from "./phone";

test("phone input preserves a leading plus while the country code is being typed", () => {
  assert.equal(normalizePhoneInput("+"), "+");
  assert.equal(normalizePhoneInput("+254 712 345 678"), "+254712345678");
  assert.equal(isValidPhoneNumber("+"), false);
  assert.equal(isValidPhoneNumber("+254712345678"), true);
});

test("verification phone normalization accepts common Kenyan formats", () => {
  assert.equal(normalizePhoneForVerification("0712 345 678"), "+254712345678");
  assert.equal(normalizePhoneForVerification("712345678"), "+254712345678");
  assert.equal(normalizePhoneForVerification("254712345678"), "+254712345678");
  assert.equal(
    normalizePhoneForVerification("+254 712 345 678"),
    "+254712345678",
  );
});

test("verification phone normalization drops the trunk 0 repeated after 254", () => {
  assert.equal(normalizePhoneForVerification("+2540712345678"), "+254712345678");
  assert.equal(normalizePhoneForVerification("254 0712345678"), "+254712345678");
  assert.equal(normalizePhoneForVerification("+254 (0) 712-345-678"), "+254712345678");
});

test("shared phone validation rejects Kenyan-prefixed numbers of the wrong length", () => {
  for (const phone of ["071234567", "07123456789", "+25471234567", "2547123456789", "00000000"]) {
    assert.equal(isValidPhoneNumber(phone), false, phone);
  }
  for (const phone of ["0712345678", "+254712345678", "+2540712345678", "+14155550132"]) {
    assert.equal(isValidPhoneNumber(phone), true, phone);
  }
  // Non-Kenyan numbers without + stay a caller decision outside listing phones.
  assert.equal(isValidPhoneNumber("12345678"), true);
});

test("listing phone normalizes Kenyan numbers to +254 and 9 digits", () => {
  const accepted = {
    "0712 345 678": "+254712345678",
    "0112-345-678": "+254112345678",
    "712345678": "+254712345678",
    "112345678": "+254112345678",
    "254712345678": "+254712345678",
    "+254 712 345 678": "+254712345678",
    "+2540712345678": "+254712345678",
    "254 0712345678": "+254712345678",
    "020 1234567": "+254201234567",
    "(020) 123-4567": "+254201234567",
    " +1 415 555 0132 ": "+14155550132",
    "+44 20 7946 0958": "+442079460958",
  };
  for (const [input, expected] of Object.entries(accepted)) {
    assert.equal(normalizeListingPhone(input), expected, input);
  }
});

test("listing phone rejects wrong-length Kenyan, unprefixed and malformed numbers", () => {
  for (const phone of [
    "071234567", "07123456789", "+25471234567", "+2547123456789", "25471234567",
    "12345678", "00000000", "7123456789", "+0712345678", "+1234567", "+1234567890123456",
    "0712a345678", "07+12345678", "", "+",
  ]) {
    assert.equal(normalizeListingPhone(phone), null, phone);
  }
});
