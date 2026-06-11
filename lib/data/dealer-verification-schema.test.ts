import assert from "node:assert/strict";
import {
  isDealerVerificationSchemaMismatch,
  isMissingDealerVerificationDocumentsStorageShape,
} from "./dealer-verification-schema";

assert.equal(
  isDealerVerificationSchemaMismatch({
    message: "column dealer_verification_documents_1.r2_key does not exist",
  }),
  true
);

assert.equal(
  isDealerVerificationSchemaMismatch({
    message: "Could not find the 'mime_type' column of 'dealer_verification_documents'",
  }),
  true
);

assert.equal(
  isMissingDealerVerificationDocumentsStorageShape({
    message: "Could not find the 'r2_key' column of 'dealer_verification_documents'",
  }),
  true
);

assert.equal(isDealerVerificationSchemaMismatch({ message: "permission denied" }), false);
