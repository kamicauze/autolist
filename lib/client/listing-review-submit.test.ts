import assert from "node:assert/strict";
import test from "node:test";
import {
  LISTING_REVIEW_RETRY_ERROR,
  submitListingReviewWithRecovery,
} from "./listing-review-submit";

test("returns the first successful review submission without retrying", async () => {
  let attempts = 0;
  const result = await submitListingReviewWithRecovery("listing-1", async () => {
    attempts += 1;
    return { success: true, autoApproved: true };
  });

  assert.equal(attempts, 1);
  assert.deepEqual(result, { success: true, autoApproved: true });
});

test("retries once when the final review action is interrupted", async () => {
  let attempts = 0;
  const result = await submitListingReviewWithRecovery("listing-1", async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("Server action transport interrupted");
    return { success: true, autoApproved: false, alreadySubmitted: true };
  });

  assert.equal(attempts, 2);
  assert.deepEqual(result, {
    success: true,
    autoApproved: false,
    alreadySubmitted: true,
  });
});

test("reports that the saved draft can be continued when both attempts fail", async () => {
  let attempts = 0;
  const result = await submitListingReviewWithRecovery("listing-1", async () => {
    attempts += 1;
    throw new Error("Server unavailable");
  });

  assert.equal(attempts, 2);
  assert.deepEqual(result, { error: LISTING_REVIEW_RETRY_ERROR });
});
