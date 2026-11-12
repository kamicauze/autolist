import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const resend = readFileSync(
  path.join(process.cwd(), "components/auth/resend-verification.tsx"),
  "utf8",
);

test("resend success copy stays neutral and tells confirmed users to sign in", () => {
  assert.match(resend, /If this email is still awaiting verification, we've sent a new link\./);
  assert.match(resend, /If you've already confirmed it, just sign in with your password\./);
  assert.doesNotMatch(resend, /a new link has been sent/);
});
