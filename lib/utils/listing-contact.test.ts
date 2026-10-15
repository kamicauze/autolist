import assert from "node:assert/strict";
import test from "node:test";
import { getPrivateListingContact } from "./listing-contact";

test("private listings use their submitted contact details", () => {
  assert.deepEqual(getPrivateListingContact({ metadata: {
    phoneNumber: "+254712345678", whatsappNumber: "+254733456789",
    allowPhoneCalls: true, whatsappEnabled: true,
  } }), { phoneNumber: "+254712345678", whatsappNumber: "+254733456789" });
});

test("private contact keeps call and WhatsApp preferences independent", () => {
  const metadata = { phoneNumber: "+254712345678", whatsappNumber: "+254733456789" };
  assert.deepEqual(getPrivateListingContact({ metadata: { ...metadata, hidePhoneNumber: true } }), {
    phoneNumber: null, whatsappNumber: "+254733456789",
  });
  assert.equal(getPrivateListingContact({ metadata: { ...metadata, allowPhoneCalls: false } }).phoneNumber, null);
  assert.deepEqual(getPrivateListingContact({ metadata: { ...metadata, whatsappEnabled: false } }), {
    phoneNumber: "+254712345678", whatsappNumber: null,
  });
});

test("legacy private contacts can use their phone for WhatsApp without inventing a number", () => {
  assert.deepEqual(getPrivateListingContact({ metadata: { phoneNumber: "0712345678" } }), {
    phoneNumber: "0712345678", whatsappNumber: "0712345678",
  });
  assert.deepEqual(getPrivateListingContact({ metadata: null }), { phoneNumber: null, whatsappNumber: null });
});
