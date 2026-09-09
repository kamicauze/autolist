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
  assert.match(form, /role: selectedRole/);
  assert.match(form, /Private seller onboarding/);
  assert.match(onboarding, /title: "Private seller"/);
  assert.match(onboarding, /Private seller profile saved/);
  assert.doesNotMatch(onboarding, /title: "Seller"/);
});
