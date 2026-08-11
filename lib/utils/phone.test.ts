import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidPhoneNumber,
  normalizePhoneInput,
} from "./phone";

test("phone input preserves a leading plus while the country code is being typed", () => {
  assert.equal(normalizePhoneInput("+"), "+");
  assert.equal(normalizePhoneInput("+254 712 345 678"), "+254712345678");
  assert.equal(isValidPhoneNumber("+"), false);
  assert.equal(isValidPhoneNumber("+254712345678"), true);
});
