import assert from "node:assert/strict";
import test from "node:test";
import { DEALERSHIP_NAME_ERROR } from "@/lib/validations/registration";
import { DEFAULT_DATA, getDealerStepErrors, getVisibleStepErrors } from "./dealer-signup-flow";

const noUploads = { hasSavedCertificate: false, uploadError: null };
const dealership = {
  ...DEFAULT_DATA,
  dealershipName: "Sample Motors Ltd",
  dealershipAddress: "Sample Road",
  cityTown: "Nairobi",
  locationArea: "Westlands",
  mobileNumber: "0712 345 678",
  officialEmail: "sales@example.com",
  whatsappNumber: "+254 712 345 678",
};
const messages = (errors: { message: string }[]) => errors.map(({ message }) => message);

test("a fresh verification form hides step errors until Continue or an edited field is left", () => {
  const errors = getDealerStepErrors(0, DEFAULT_DATA, noUploads);
  assert.ok(errors.length > 0);
  assert.deepEqual(getVisibleStepErrors(errors, false, new Set()), []);
  assert.deepEqual(
    messages(getVisibleStepErrors(errors, false, new Set(["whatsappNumber"]))),
    ["Enter a valid WhatsApp contact number, e.g. 0712 345 678 or +254 712 345 678."],
  );
  assert.deepEqual(getVisibleStepErrors(errors, true, new Set()), errors);
});

test("errors without a field, such as upload failures, wait for a Continue attempt", () => {
  const errors = getDealerStepErrors(3, { ...DEFAULT_DATA, acceptDealerTerms: true, acceptPrivacyPolicy: true }, {
    hasSavedCertificate: true, uploadError: "sample.pdf exceeds 10MB limit.",
  });
  assert.deepEqual(messages(errors), ["sample.pdf exceeds 10MB limit."]);
  assert.deepEqual(getVisibleStepErrors(errors, false, new Set(["acceptDealerTerms"])), []);
  assert.deepEqual(getVisibleStepErrors(errors, true, new Set()), errors);
});

test("verification phones use the strict listing phone rule", () => {
  assert.deepEqual(getDealerStepErrors(0, dealership, noUploads), []);
  assert.deepEqual(getDealerStepErrors(0, { ...dealership, whatsappNumber: "+2540712345678" }, noUploads), []);
  assert.deepEqual(
    getDealerStepErrors(0, { ...dealership, mobileNumber: "071234567", whatsappNumber: "12345678" }, noUploads)
      .map(({ field }) => field),
    ["mobileNumber", "whatsappNumber"],
  );

  const contact = {
    ...DEFAULT_DATA,
    contactFullName: "Sample Contact",
    contactRole: "Sales Manager",
    contactMobile: "0712345678",
    contactEmail: "contact@example.com",
    contactPhotoName: "contact.jpg",
  };
  assert.deepEqual(getDealerStepErrors(2, contact, noUploads), []);
  assert.deepEqual(
    getDealerStepErrors(2, { ...contact, contactMobile: "07123456789", contactWhatsapp: "+2540712345" }, noUploads)
      .map(({ field }) => field),
    ["contactMobile", "contactWhatsapp"],
  );
});

test("the verification form applies the dealership name rule", () => {
  assert.deepEqual(
    getDealerStepErrors(0, { ...dealership, dealershipName: "Sample Motors <b>Ltd</b> 🚗" }, noUploads),
    [{ field: "dealershipName", message: DEALERSHIP_NAME_ERROR }],
  );
});
