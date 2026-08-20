import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260820083624_create_private_seller_verification.sql",
);
const migration = readFileSync(migrationPath, "utf8");
const actions = readFileSync(
  path.join(process.cwd(), "lib/actions/seller-verification.ts"),
  "utf8",
);

test("seller KYC storage stays private and metadata is protected by RLS", () => {
  assert.match(migration, /'seller-kyc'[\s\S]*?false/);
  assert.match(
    migration,
    /alter table public\.seller_verifications enable row level security/,
  );
  assert.match(
    migration,
    /alter table public\.seller_verification_documents enable row level security/,
  );
  assert.match(
    migration,
    /revoke all on public\.seller_phone_verification_challenges from public, anon, authenticated/,
  );
  assert.doesNotMatch(migration, /on\s+storage\.objects/i);
});

test("phone OTPs are digested, bounded, and restricted to stored private sellers", () => {
  assert.match(actions, /profile\?\.role !== "seller"/);
  assert.match(actions, /createHmac\("sha256", getOtpSecret\(\)\)/);
  assert.match(actions, /const OTP_TTL_MS = 10 \* 60 \* 1000/);
  assert.match(actions, /const OTP_MAX_ATTEMPTS = 5/);
  assert.match(actions, /timingSafeEqual/);
  assert.doesNotMatch(actions, /code:\s*code[,\n]/);
});

test("pending and approved verification records are immutable to the seller", () => {
  assert.match(actions, /data\.status === "pending"/);
  assert.match(actions, /data\.status === "approved"/);
  assert.match(actions, /ensureEditableSellerVerification/);
});
