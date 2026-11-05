import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { USER_ROLE_OPTIONS } from "../../lib/constants/marketplace";

const page = readFileSync(
  path.join(process.cwd(), "app/register/page.tsx"),
  "utf8",
);
const form = readFileSync(
  path.join(process.cwd(), "components/auth/register-form.tsx"),
  "utf8",
);
const shell = readFileSync(
  path.join(process.cwd(), "components/auth/login-account-shell.tsx"),
  "utf8",
);
const onboarding = readFileSync(
  path.join(process.cwd(), "components/seller/onboarding-flow.tsx"),
  "utf8",
);

test("registration uses the same account shell language and a deliberate replacement image", () => {
  assert.match(page, /RegisterAccountShell/);
  assert.match(shell, /activeView="register"/);
  assert.match(shell, /Create your Autolist account/);
  assert.match(shell, /src=\{imageSrc\}/);
  assert.match(shell, /imageSrc="\/auth\/login-bmw-x2-front\.jpg"/);
  assert.doesNotMatch(page, /sample-car-2\.jpg/);
  assert.match(shell, /min-h-\[100dvh\]/);
  assert.match(form, /data-testid="register-google"/);
  assert.doesNotMatch(form, /data-testid="register-facebook"/);
});

test("account selection is a reversible first step that retains the form component state", () => {
  assert.match(form, /useState<RegistrationStep>\("role"\)/);
  assert.match(form, /registrationStep === "role"/);
  assert.match(form, /Step 1 of 2/);
  assert.match(form, /data-testid="register-role-continue"/);
  assert.match(form, /data-testid="register-change-role"/);
  assert.match(form, /setRegistrationStep\("role"\)/);
  assert.match(form, /setRegistrationStep\("details"\)/);
});

test("Private seller remains presentation copy over the existing seller role value", () => {
  const privateSeller = USER_ROLE_OPTIONS.find((option) => option.value === "seller");

  assert.equal(privateSeller?.label, "Private seller");
  assert.match(form, /intended_role: selectedRole/);
  assert.match(form, /privateSellerSetupPath\(requestedNextPath\)/);
  assert.match(form, /Private seller onboarding/);
  assert.match(onboarding, /title: "Private seller"/);
  assert.match(onboarding, /Private seller profile saved/);
  assert.doesNotMatch(onboarding, /title: "Seller"/);
});

test("account creation requires readable Terms and Privacy consent", () => {
  assert.match(form, /data-testid="register-accept-terms"/);
  assert.match(form, /data-testid="register-accept-privacy"/);
  assert.match(form, /href="\/terms"[\s\S]*?target="_blank"/);
  assert.match(form, /href="\/privacy"[\s\S]*?target="_blank"/);
  assert.match(form, /if \(!acceptTerms \|\| !acceptPrivacy\)/);
  assert.match(form, /terms_accepted_at: new Date\(\)\.toISOString\(\)/);
  assert.match(form, /privacy_accepted_at: new Date\(\)\.toISOString\(\)/);
});

test("registration uses email credentials without requesting a username", () => {
  assert.doesNotMatch(form, /register-name|register-full-name|User name|fullName|full_name/);
  assert.match(form, /id="register-email"\s+name="email"\s+type="email"\s+autoComplete="username"/);
  assert.match(form, /id="register-password"[\s\S]*?autoComplete="new-password"/);
  assert.match(form, /id="register-confirm-password"[\s\S]*?autoComplete="new-password"/);
});

test("duplicate signup exits before success feedback", () => {
  const duplicateCheck = form.indexOf("if (!data.session && isExistingRegistration(data.user))");
  assert.ok(duplicateCheck > form.indexOf("supabase.auth.signUp"));
  assert.ok(duplicateCheck < form.indexOf("Account created. Check your email"));
  assert.match(form.slice(duplicateCheck), /setErrorMessage\(EMAIL_ALREADY_REGISTERED_MESSAGE\);\s*return;/);
});

test("email signup uses the confirmation handoff while Google retains its session callback", () => {
  assert.match(form, /emailRedirectTo: getSignupVerificationUrl\(nextPath\)/);
  assert.match(form, /const redirectTo = getAuthCallbackUrl\(nextPath\)/);
});
