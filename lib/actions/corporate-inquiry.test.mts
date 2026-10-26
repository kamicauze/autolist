import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";

const originalEnvironment = { vercel: process.env.VERCEL_ENV, email: process.env.EMAIL_PROVIDER };
const emails: Array<{ to: string; subject: string; text: string }> = [];
let mode: "success" | "failure" | "throw" = "success";
mock.module("@/lib/server/delivery-providers", { namedExports: {
  sendProviderEmail: async (email: { to: string; subject: string; text: string }) => {
    emails.push(email);
    if (mode === "throw") throw new Error("Private provider failure");
    return { success: mode === "success", error: "Private provider failure" };
  },
} });
const { submitCorporateInquiry } = await import("./corporate-inquiry");

beforeEach(() => {
  process.env.VERCEL_ENV = "preview";
  process.env.EMAIL_PROVIDER = "mailtrap";
  mode = "success";
  emails.length = 0;
});
after(() => {
  for (const [key, value] of [["VERCEL_ENV", originalEnvironment.vercel], ["EMAIL_PROVIDER", originalEnvironment.email]]) {
    if (value === undefined) delete process.env[key!];
    else process.env[key!] = value;
  }
});

test("validates email before delivery", async () => {
  for (const value of ["", "not-an-email", "a@example.com\nBcc: other@example.com", "a".repeat(160) + "@example.com"]) {
    assert.equal((await submitCorporateInquiry(value)).success, false);
  }
  assert.equal(emails.length, 0);
});

test("sends the trimmed contact to the fixed sales recipient through the preview sandbox", async () => {
  assert.equal((await submitCorporateInquiry("  partner@example.com  ")).success, true);
  assert.equal(emails.length, 1);
  assert.equal(emails[0].to, "sales@autolist.co.ke");
  assert.match(emails[0].text, /contact partner@example\.com/);
  assert.equal(emails[0].subject, "Corporate advertising and partnership inquiry");
});

test("prevents preview and local requests from using a live delivery provider", async () => {
  process.env.EMAIL_PROVIDER = "resend";
  assert.equal((await submitCorporateInquiry("partner@example.com")).success, false);
  delete process.env.VERCEL_ENV;
  assert.equal((await submitCorporateInquiry("partner@example.com")).success, false);
  assert.equal(emails.length, 0);
});

test("uses the existing provider for production delivery to sales", async () => {
  process.env.VERCEL_ENV = "production";
  process.env.EMAIL_PROVIDER = "resend";
  assert.equal((await submitCorporateInquiry("partner@example.com")).success, true);
  assert.equal(emails[0].to, "sales@autolist.co.ke");
});

test("reports failure without exposing provider details or claiming success", async () => {
  for (const failure of ["failure", "throw"] as const) {
    mode = failure;
    const result = await submitCorporateInquiry("partner@example.com");
    assert.equal(result.success, false);
    assert.doesNotMatch(JSON.stringify(result), /Private provider failure/);
    assert.match(JSON.stringify(result), /sales@autolist\.co\.ke/);
  }
});
