import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const migration = readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260909160440_create_private_dealer_kyc_storage.sql",
  ),
  "utf8",
);
const actions = readFileSync(
  path.join(process.cwd(), "lib/actions/dealers.ts"),
  "utf8",
);
const data = readFileSync(
  path.join(process.cwd(), "lib/data/dealers.ts"),
  "utf8",
);
const ownerPanel = readFileSync(
  path.join(
    process.cwd(),
    "components/dashboard/verification/verification-upload-panel.tsx",
  ),
  "utf8",
);

test("dealer KYC bucket is private and the legacy metadata shape is normalized", () => {
  assert.match(migration, /'dealer-kyc'[\s\S]*?false/);
  assert.match(migration, /alter column file_url drop not null/);
  assert.match(migration, /add column if not exists r2_key text/);
  assert.match(migration, /add column if not exists uploaded_by uuid/);
  assert.doesNotMatch(migration, /on\s+storage\.objects/i);
});

test("identity and incorporation uploads use private storage and signed review links", () => {
  assert.match(actions, /uploadDealerKycFile/);
  assert.match(actions, /DEALER_KYC_BUCKET/);
  assert.match(actions, /"incorporation_certificate"/);
  assert.match(actions, /"contact_id"/);
  assert.match(data, /createDealerKycReviewUrl/);
  assert.match(ownerPanel, /currentDocument\.review_url/);
  assert.doesNotMatch(ownerPanel, /getImageUrl/);
});
