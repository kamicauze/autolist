import assert from "node:assert/strict";
import { after, afterEach, beforeEach, mock, test } from "node:test";

mock.module("server-only", { namedExports: {} });
const { sendProviderEmail, sendProviderPhoneOtp, sendProviderWhatsApp } = await import("./delivery-providers");
const keys = ["VERCEL_ENV", "EMAIL_PROVIDER", "RESEND_API_KEY", "EMAIL_FROM", "MAILTRAP_API_TOKEN", "MAILTRAP_INBOX_ID", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_OTP_TEMPLATE_NAME", "WHATSAPP_OTP_TEMPLATE_LANGUAGE"] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
let requests: Array<{ url: string; body: Record<string, unknown> }>;
let acknowledged: boolean;
beforeEach(() => {
  Object.assign(process.env, {
    VERCEL_ENV: "production", EMAIL_PROVIDER: "resend", RESEND_API_KEY: "sample_email_key",
    EMAIL_FROM: "Autolist <notifications@example.com>", MAILTRAP_API_TOKEN: "sample_sandbox_key",
    MAILTRAP_INBOX_ID: "sample_inbox", WHATSAPP_ACCESS_TOKEN: "sample_phone_token",
    WHATSAPP_PHONE_NUMBER_ID: "sample_phone", WHATSAPP_OTP_TEMPLATE_NAME: "phone_verification",
    WHATSAPP_OTP_TEMPLATE_LANGUAGE: "en_US",
  });
  requests = []; acknowledged = true;
  mock.method(globalThis, "fetch", async (url: unknown, init: RequestInit) => {
    requests.push({ url: String(url), body: JSON.parse(String(init.body)) });
    return Response.json({ id: "sample_email", message_ids: ["sample_sandbox_email"], messages: acknowledged ? [{ id: "sample_phone_message" }] : [] });
  });
});
afterEach(() => mock.restoreAll());
after(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
  }
});
const email = { to: "recipient@example.com", subject: "Listing enquiry", text: "New enquiry" };

test("email cannot silently use a sandbox in production or a live sender in preview", async () => {
  process.env.EMAIL_PROVIDER = "mailtrap";
  assert.equal((await sendProviderEmail(email)).success, false);
  process.env.VERCEL_ENV = "preview"; process.env.EMAIL_PROVIDER = "resend";
  assert.equal((await sendProviderEmail(email)).success, false);
  assert.equal(requests.length, 0);
});
test("configured production and preview email use the intended provider", async () => {
  assert.equal((await sendProviderEmail(email)).success, true);
  assert.equal(requests[0].url, "https://api.resend.com/emails");
  process.env.VERCEL_ENV = "preview"; process.env.EMAIL_PROVIDER = "mailtrap";
  assert.equal((await sendProviderEmail(email)).success, true);
  assert.match(requests[1].url, /^https:\/\/sandbox\.api\.mailtrap\.io\//);
});
test("phone OTP uses an authentication template with matching body and copy-code parameters", async () => {
  assert.equal((await sendProviderPhoneOtp({ to: "+254 700 000 001", code: "123456" })).success, true);
  assert.deepEqual(requests[0].body, {
    messaging_product: "whatsapp", to: "254700000001", type: "template",
    template: { name: "phone_verification", language: { code: "en_US" }, components: [
      { type: "body", parameters: [{ type: "text", text: "123456" }] },
      { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: "123456" }] },
    ] },
  });
});
test("invalid or unconfigured OTP requests fail before contacting WhatsApp", async () => {
  assert.equal((await sendProviderPhoneOtp({ to: "+254700000001", code: "invalid" })).success, false);
  delete process.env.WHATSAPP_OTP_TEMPLATE_NAME;
  assert.equal((await sendProviderPhoneOtp({ to: "+254700000001", code: "123456" })).success, false);
  assert.equal(requests.length, 0);
});
test("existing WhatsApp notifications retain text delivery and require provider acknowledgement", async () => {
  assert.equal((await sendProviderWhatsApp({ to: "+254700000001", body: "New enquiry" })).success, true);
  assert.equal(requests[0].body.type, "text");
  acknowledged = false;
  assert.equal((await sendProviderPhoneOtp({ to: "+254700000001", code: "123456" })).success, false);
});
