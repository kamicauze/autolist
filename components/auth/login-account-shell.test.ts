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
  assert.match(shell, /src="\/hero-car\.jpg"/);
  assert.match(shell, /backdrop-blur-xl/);
  assert.doesNotMatch(shell, /mobile\.de/i);
});

test("login only renders providers supported by the existing form", () => {
  assert.match(form, /Continue with Google/);
  assert.match(form, /Continue with Facebook/);
  assert.doesNotMatch(form, /Continue with Apple/);
});
