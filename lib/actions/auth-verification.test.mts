import assert from "node:assert/strict";
import { mock, test } from "node:test";

let providerError: { status: number; message: string } | null = null;
const calls: Array<{ email: string; type: string; options: { emailRedirectTo: string } }> = [];
mock.module("next/headers", { namedExports: { headers: async () => new Headers({ origin: "http://localhost:3002" }) } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ auth: {
  resend: async (request: (typeof calls)[number]) => { calls.push(request); return { error: providerError }; },
} }) } });
const { resendSignupVerification } = await import("./auth-verification");

test("resend validates email before reaching auth and keeps the browser callback origin", async () => {
  assert.match((await resendSignupVerification("bad-email", "/dashboard")).error!, /Enter your email/);
  assert.equal(calls.length, 0);
  assert.deepEqual(await resendSignupVerification(" Seller@Example.com ", "/sell/dealer?draft=1"), { success: true });
  assert.deepEqual(calls[0], {
    email: "seller@example.com", type: "signup",
    options: { emailRedirectTo: "http://localhost:3002/login?verification=complete&next=%2Fsell%2Fdealer%3Fdraft%3D1" },
  });
});

test("resend rejects external destinations and does not expose provider account details", async () => {
  providerError = { status: 400, message: "Email is already confirmed for an existing account" };
  const result = await resendSignupVerification("seller@example.com", "https://example.net/account");
  assert.equal(calls.at(-1)?.options.emailRedirectTo, "http://localhost:3002/login?verification=complete");
  assert.equal(result.error, "We could not send the verification email. Please try again shortly.");
  providerError = { status: 429, message: "provider internal rate limit details" };
  assert.equal((await resendSignupVerification("seller@example.com", "//example.net")).error,
    "Please wait a minute before requesting another verification email.");
});


test("installed Supabase resend uses implicit confirmation rather than a PKCE challenge", async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
  const supabase = createClient("https://auth.example.invalid", "public-test-key", {
    auth: { flowType: "pkce", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (url, options) => {
      requests.push({ url: String(url), body: JSON.parse(String(options?.body)) });
      return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
    } },
  });
  const { error } = await supabase.auth.resend({
    type: "signup", email: "seller@example.com",
    options: { emailRedirectTo: "http://localhost:3002/login?verification=complete" },
  });
  assert.equal(error, null);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].body.type, "signup");
  assert.equal(requests[0].body.code_challenge, undefined);
  assert.equal(new URL(requests[0].url).searchParams.get("redirect_to"), "http://localhost:3002/login?verification=complete");
});
