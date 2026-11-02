import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";

const originalSetting = process.env.WHATSAPP_ENABLED;
const profileId = "phone-verification-seller";
let authenticated = true;
let role = "seller";
let allowKycReads = false;
let adminCalls = 0;
let writes = 0;
let deliveries = 0;

mock.module("next/cache", { namedExports: { revalidatePath() {} } });
mock.module("@/lib/admin/guard", { namedExports: {
  requireAdminAction: async () => ({ user: { id: "verification-reviewer" } }),
} });
mock.module("@/lib/data/seller-verification", { namedExports: {
  isSellerVerificationSchemaUnavailable: () => false,
} });
mock.module("@/lib/server/delivery-providers", { namedExports: {
  sendProviderPhoneOtp: async () => { deliveries++; throw Error("Unexpected delivery"); },
} });
mock.module("@/lib/supabase/server", { namedExports: {
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: profileId } : null } }) },
    from: () => {
      const query = {
        select() { return query; }, eq() { return query; },
        maybeSingle: async () => ({ data: { role }, error: null }),
      };
      return query;
    },
  }),
} });
mock.module("@/lib/supabase/admin", { namedExports: {
  createAdminClient: () => {
    adminCalls++;
    if (!allowKycReads) throw Error("Unexpected privileged database access");
    return { from: () => {
      const unexpectedWrite = () => { writes++; throw Error("Unexpected verification write"); };
      const query = {
        select() { return query; }, eq() { return query; },
        maybeSingle: async () => ({ data: { status: "pending", phone: "+254712345678", phone_verified_at: null }, error: null }),
        then(resolve: (value: object) => unknown) {
          return Promise.resolve({ data: [{ document_type: "national_id_front" }, { document_type: "national_id_back" }], error: null }).then(resolve);
        },
        upsert: unexpectedWrite, update: unexpectedWrite, insert: unexpectedWrite, delete: unexpectedWrite,
      };
      return query;
    } };
  },
} });

const { requestSellerPhoneOtp, verifySellerPhoneOtp, createSellerKycUploadTicket,
  finalizeSellerKycDocument, submitSellerVerification, approveSellerVerification } =
  await import("./seller-verification");
const errorOf = (result: object) => "error" in result ? String(result.error) : "";

beforeEach(() => {
  process.env.WHATSAPP_ENABLED = "false";
  authenticated = true; role = "seller"; allowKycReads = false;
  adminCalls = 0; writes = 0; deliveries = 0;
});
after(() => {
  if (originalSetting === undefined) delete process.env.WHATSAPP_ENABLED;
  else process.env.WHATSAPP_ENABLED = originalSetting;
});

test("disabled phone verification rejects issuing and consuming codes before privileged access or delivery", async () => {
  assert.match(errorOf(await requestSellerPhoneOtp("+254712345678")), /temporarily unavailable/);
  assert.match(errorOf(await verifySellerPhoneOtp("123456")), /temporarily unavailable/);
  assert.equal(adminCalls, 0);
  assert.equal(writes, 0);
  assert.equal(deliveries, 0);
});

test("private seller authorization still runs when phone verification is unavailable", async () => {
  authenticated = false;
  assert.equal(errorOf(await requestSellerPhoneOtp("+254712345678")), "Unauthorized");
  authenticated = true; role = "dealer";
  assert.match(errorOf(await verifySellerPhoneOtp("123456")), /only available to individual sellers/);
  assert.equal(adminCalls, 0);
});

test("paused private verification rejects upload tickets, finalization and submission before privileged access or writes", async () => {
  const document = {
    documentType: "national_id_front" as const,
    fileName: "identity-front.pdf", contentType: "application/pdf", sizeBytes: 1024,
  };
  assert.match(errorOf(await createSellerKycUploadTicket(document)), /Private seller verification is temporarily unavailable/);
  assert.match(errorOf(await finalizeSellerKycDocument({
    ...document, storagePath: `${profileId}/national_id_front/identity-front.pdf`,
  })), /Private seller verification is temporarily unavailable/);
  assert.match(errorOf(await submitSellerVerification()), /Private seller verification is temporarily unavailable/);
  assert.equal(adminCalls, 0);
  assert.equal(writes, 0);
  assert.equal(deliveries, 0);
});

test("private KYC submission and staff approval retain their genuine phone prerequisite", async () => {
  delete process.env.WHATSAPP_ENABLED;
  allowKycReads = true;
  assert.match(errorOf(await submitSellerVerification()), /Verify your phone number before submitting KYC/);
  process.env.WHATSAPP_ENABLED = "false";
  assert.match(errorOf(await approveSellerVerification(profileId)), /phone number is not verified/);
  assert.equal(writes, 0);
  assert.equal(deliveries, 0);
});
