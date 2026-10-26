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
const { submitCorporateInquiry, submitAdvertisingInquiry } = await import("./corporate-inquiry");

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


const mediaKitRequest = {
  companyName: "  Sample Automotive  ",
  contactName: "  Alex Partner  ",
  jobTitle: "  Marketing Manager  ",
  email: "  partner@example.com  ",
  phone: "  +254 700 000 000  ",
  businessType: "Bank",
  placements: ["Hero Banner", "Top Banner"],
  budgetRange: "KES 100,000–250,000",
  message: "  Please send the media kit.  ",
};

test("validates required campaign details, enum options and field bounds before delivery", async () => {
  for (const change of [
    { companyName: " " }, { contactName: "" }, { jobTitle: "" }, { email: "invalid" },
    { phone: "abcdefg" }, { phone: "123-45" }, { businessType: "Unrecognized" },
    { placements: ["Unrecognized"] }, { budgetRange: "Unrecognized" },
    { companyName: "x".repeat(161) }, { message: "x".repeat(2001) },
    { contactName: "Alex\nEmail: other@example.com" },
  ]) {
    assert.equal((await submitAdvertisingInquiry({ ...mediaKitRequest, ...change })).success, false);
  }
  assert.equal((await submitAdvertisingInquiry(null)).success, false);
  assert.equal(emails.length, 0);
});

test("delivers all trimmed media-kit details to the fixed sales recipient", async () => {
  const result = await submitAdvertisingInquiry({ ...mediaKitRequest, to: "other@example.com" });
  assert.equal(result.success, true);
  assert.equal(emails.length, 1);
  assert.equal(emails[0].to, "sales@autolist.co.ke");
  assert.equal(emails[0].subject, "Advertising media kit request");
  for (const detail of [
    "Company: Sample Automotive", "Contact person: Alex Partner", "Job title: Marketing Manager",
    "Email: partner@example.com", "Phone: +254 700 000 000", "Business type: Bank",
    "Placements: Hero Banner, Top Banner", "Monthly budget: KES 100,000–250,000",
    "Additional message: Please send the media kit.",
  ]) assert.ok(emails[0].text.includes(detail), detail);
  assert.doesNotMatch(JSON.stringify(result), /on its way|attached/i);
});

test("accepts omitted optional campaign fields", async () => {
  const { placements, budgetRange, message, ...required } = mediaKitRequest;
  void placements; void budgetRange; void message;
  assert.equal((await submitAdvertisingInquiry(required)).success, true);
  assert.match(emails[0].text, /Placements: Not specified/);
  assert.match(emails[0].text, /Monthly budget: Not specified/);
});

test("media-kit requests preserve sandbox guard, production routing and safe provider failures", async () => {
  process.env.EMAIL_PROVIDER = "resend";
  assert.equal((await submitAdvertisingInquiry(mediaKitRequest)).success, false);
  delete process.env.VERCEL_ENV;
  assert.equal((await submitAdvertisingInquiry(mediaKitRequest)).success, false);
  assert.equal(emails.length, 0);
  process.env.VERCEL_ENV = "production";
  assert.equal((await submitAdvertisingInquiry(mediaKitRequest)).success, true);
  assert.equal(emails[0].to, "sales@autolist.co.ke");
  for (const failure of ["failure", "throw"] as const) {
    mode = failure;
    const result = await submitAdvertisingInquiry(mediaKitRequest);
    assert.equal(result.success, false);
    assert.doesNotMatch(JSON.stringify(result), /Private provider failure/);
    assert.match(JSON.stringify(result), /sales@autolist\.co\.ke/);
  }
});
