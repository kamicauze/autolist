import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const shell = readFileSync(
  path.join(process.cwd(), "components/auth/login-account-shell.tsx"),
  "utf8",
);
const form = readFileSync(
  path.join(process.cwd(), "components/auth/login-form.tsx"),
  "utf8",
);

test("login adopts the supplied two-panel account structure with truthful Autolist copy", () => {
  assert.match(shell, /\bLogin\b/);
  assert.match(shell, /\bRegister\b/);
  assert.match(shell, /Your advantages with an Autolist account/);
  assert.match(shell, /Manage listings and dealer offers/);
  assert.match(shell, /min-h-\[100dvh\] items-center/);
  assert.match(shell, /activeView="login"[^>]*imageSrc="\/auth\/login-bmw-sunset\.webp"/);
  assert.match(shell, /backdrop-blur-xl/);
  assert.doesNotMatch(shell, /mobile\.de/i);
});

test("login renders Google while Facebook signup is deferred", () => {
  assert.match(form, /Continue with Google/);
  assert.doesNotMatch(form, /Continue with Facebook|login-facebook/);
  assert.doesNotMatch(form, /Continue with Apple/);
});

test("login identifies email as the saved credential", () => {
  assert.match(form, /id="login-email"\s+name="email"\s+type="email"\s+autoComplete="username"/);
  assert.match(form, /id="login-password"[\s\S]*?autoComplete="current-password"/);
});
