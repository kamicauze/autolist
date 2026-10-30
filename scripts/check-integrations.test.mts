import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const settings = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sample-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sample_public_key",
  SUPABASE_SERVICE_ROLE_KEY: "sample_private_service_key",
  NEXT_PUBLIC_SITE_URL: "https://marketplace.example",
  R2_ACCOUNT_ID: "sample_account", R2_ACCESS_KEY_ID: "sample_access_key",
  R2_SECRET_ACCESS_KEY: "sample_private_storage_key", R2_BUCKET_NAME: "production-images",
  NEXT_PUBLIC_R2_PUBLIC_URL: "https://media.marketplace.example",
  EMAIL_PROVIDER: "resend", RESEND_API_KEY: "sample_private_email_key",
  EMAIL_FROM: "Autolist <notifications@marketplace.example>",
  WHATSAPP_ACCESS_TOKEN: "sample_private_phone_token", WHATSAPP_PHONE_NUMBER_ID: "sample_phone",
  NOTIFICATION_PROCESS_SECRET: "sample_private_worker_secret",
  SELLER_PHONE_OTP_SECRET: "sample_phone_signing_secret_with_32_characters",
  WHATSAPP_OTP_TEMPLATE_NAME: "phone_verification", WHATSAPP_OTP_TEMPLATE_LANGUAGE: "en_US",
};
function check(overrides: Record<string, string> = {}, complete = true, mode = "--production") {
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-integrations.ts", mode], {
    encoding: "utf8", env: { PATH: process.env.PATH, NODE_ENV: "test", ...(complete ? settings : {}), ...overrides },
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

test("production checks do not borrow credentials from local QA files", () => {
  const result = check({}, false);
  assert.equal(result.status, 1);
  assert.match(result.output, /Missing SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(result.output, /Missing R2_BUCKET_NAME/);
});

test("production builds stop when required settings are missing; previews retain sandbox builds", () => {
  assert.equal(check({ VERCEL_ENV: "production" }, false, "--build").status, 1);
  assert.equal(check({ VERCEL_ENV: "preview" }, false, "--build").status, 0);
  assert.equal(check({ VERCEL_ENV: "production" }, true, "--build").status, 0);
});
test("complete application settings pass without disclosing secrets or claiming live acceptance", () => {
  const result = check();
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /sample_private_/);
  assert.match(result.output, /still require live acceptance/);
});
test("unsafe production email and QA settings fail", () => {
  const result = check({ EMAIL_PROVIDER: "mailtrap", QA_TOOLS_ENABLED: "true" });
  assert.equal(result.status, 1);
  assert.match(result.output, /Production EMAIL_PROVIDER must be resend/);
  assert.match(result.output, /QA account tools must be disabled/);
});
test("weak phone signing secrets and non-public site URLs fail", () => {
  const result = check({ SELLER_PHONE_OTP_SECRET: "short", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
  assert.equal(result.status, 1);
  assert.match(result.output, /at least 32 characters/);
  assert.match(result.output, /public HTTPS URL/);
});
