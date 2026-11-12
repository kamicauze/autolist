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
  assert.match(shell, /activeView="register"[^>]*imageSrc="\/auth\/register-porsche-cayenne-sunset\.webp"/);
  assert.doesNotMatch(page, /sample-car-2\.jpg/);
  assert.match(shell, /min-h-\[100dvh\]/);
  assert.match(form, /data-testid="register-google"/);
  assert.doesNotMatch(form, /data-testid="register-facebook"/);
});

test("account selection is a reversible first step that retains the form component state", () => {
  assert.match(form, /registrationStep === "role"/);
  assert.match(form, /Step 1 of 2/);
  assert.match(form, /onClick=\{continueToDetails\}\s+data-testid="register-role-continue"/);
  assert.match(form, /onClick=\{returnToRoleStep\}\s+data-testid="register-change-role"/);
  assert.doesNotMatch(form, /useState<RegistrationStep>|useState<UserRole>/);
});

test("registration step and role live in the URL so Back and refresh keep the flow", () => {
  assert.match(form, /searchParams\.get\("step"\) === "details" \? "details" : "role"/);
  assert.match(form, /const selectedRole = requestedRole \? resolveRole\(requestedRole\)/);
  assert.match(form, /new URLSearchParams\(searchParams\.toString\(\)\)/);
  assert.match(form, /params\.set\("role", role\)/);
  assert.match(form, /router\.push\(getRegistrationStepHref\(selectedRole, "details"\)\)/);
  assert.match(form, /window\.history\.replaceState\(null, "", getRegistrationStepHref\(role, "role"\)\)/);
  assert.doesNotMatch(form, /params\.set\("(?:email|password)/);
  assert.doesNotMatch(form, /localStorage|sessionStorage/);
});

test("password checklist and submit validation share one requirement list", () => {
  const handler = form.slice(form.indexOf("const handleRegister"), form.indexOf("supabase.auth.signUp"));
  assert.match(form, /PASSWORD_REQUIREMENTS\.map\(/);
  assert.match(handler, /getPasswordRequirementError\(password\)/);
  assert.match(handler, /setErrorMessage\(passwordRequirementError\);\s*return;/);
  assert.doesNotMatch(form, /\/\[A-Z\]\/|password\.length < 8/);
});

test("a created account is not signed up again until its email or password changes", () => {
  const handler = form.slice(form.indexOf("const handleRegister"), form.indexOf("supabase.auth.signUp"));
  assert.match(handler, /if \(accountCreated\) return;/);
  assert.match(form, /setAccountCreated\(true\);\s*setInfoMessage\(\s*"Account created\. Check your email/);
  assert.match(form, /setEmail\(event\.target\.value\);\s*clearCreatedAccount\(\);/);
  assert.match(form, /setPassword\(event\.target\.value\);\s*clearCreatedAccount\(\);/);
  assert.match(form, /disabled=\{isLoading \|\| !!socialLoading \|\| accountCreated\}\s+data-testid="register-submit"/);
  assert.match(form, /<ResendVerification email=\{email\} nextPath=\{nextPath\} disabled=\{isLoading \|\| !!socialLoading\} \/>/);
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

test("duplicate signup exits before navigation or success feedback", () => {
  const duplicateCheck = form.indexOf("if (!data.session && isExistingRegistration(data.user))");
  assert.ok(duplicateCheck > form.indexOf("supabase.auth.signUp"));
  assert.ok(duplicateCheck < form.indexOf("router.replace(nextPath)", duplicateCheck));
  assert.doesNotMatch(form, /\.from\("profiles"\)/);
  assert.match(form.slice(duplicateCheck), /setErrorMessage\(EMAIL_ALREADY_REGISTERED_MESSAGE\);\s*return;/);
});

test("email signup uses the confirmation handoff while Google retains its session callback", () => {
  assert.match(form, /emailRedirectTo: getSignupVerificationUrl\(nextPath\)/);
  assert.match(form, /const redirectTo = getAuthCallbackUrl\(nextPath\)/);
});

test("registration uses email credentials without requesting a username", () => {
  assert.doesNotMatch(form, /register-name|register-full-name|User name|fullName|full_name/);
  assert.match(form, /id="register-email"\s+name="email"\s+type="email"\s+autoComplete="username"/);
  assert.match(form, /id="register-password"[\s\S]*?autoComplete="new-password"/);
  assert.match(form, /id="register-confirm-password"[\s\S]*?autoComplete="new-password"/);
});

test("editing credentials clears a stale registration error", () => {
  assert.match(form, /const clearCreatedAccount = \(\) => \{\s*setErrorMessage\(null\);/);
});
