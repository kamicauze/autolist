import assert from "node:assert/strict";
import { joinPhoneCountry, splitPhoneCountry } from "./phone-country";

assert.deepEqual(splitPhoneCountry("0700000111"), { code: "+254", number: "700000111" });
assert.deepEqual(splitPhoneCountry("+447700900123"), { code: "+44", number: "7700900123" });
assert.deepEqual(splitPhoneCountry("+33123456789"), { code: "", number: "+33123456789" });
assert.equal(joinPhoneCountry("+254", "0700000111"), "+254700000111");
assert.equal(joinPhoneCountry("+44", "7700900123"), "+447700900123");
assert.equal(joinPhoneCountry("+254", "+33123456789"), "+33123456789");
assert.equal(joinPhoneCountry("+254", ""), "");
assert.equal(joinPhoneCountry("", "+33123456789"), "+33123456789");
console.log("phone country checks passed");
