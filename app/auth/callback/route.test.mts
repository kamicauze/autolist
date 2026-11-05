import assert from "node:assert/strict";
import { mock, test } from "node:test";
let exchangeError: { message: string } | null = null;
let exchanges = 0;
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ auth: {
  exchangeCodeForSession: async () => { exchanges++; return { error: exchangeError }; },
} }) } });
const { GET } = await import("./route");

test("legacy confirmation exchange failure offers sign-in without claiming email verification failed", async () => {
  exchangeError = { message: "PKCE code verifier not found" };
  const response = await GET(new Request("https://autolist.co.ke/auth/callback?code=sample-code&next=%2Fregister%2Fdealer"));
  assert.equal(response.headers.get("location"), "https://autolist.co.ke/login?verification=signin&next=%2Fregister%2Fdealer");
});

test("successful OAuth exchange still continues to the requested internal destination", async () => {
  exchangeError = null;
  const response = await GET(new Request("https://autolist.co.ke/auth/callback?code=sample-code&next=%2Fdashboard"));
  assert.equal(response.headers.get("location"), "https://autolist.co.ke/dashboard");
});

test("expired or invalid provider links retain recovery and reject external destinations", async () => {
  const before = exchanges;
  const response = await GET(new Request("https://autolist.co.ke/auth/callback?error=access_denied&error_code=otp_expired&next=https%3A%2F%2Foutside.example"));
  assert.equal(response.headers.get("location"), "https://autolist.co.ke/login?verification=failed");
  assert.equal(exchanges, before);
});

test("new confirmation links require no original-browser exchange and keep the login destination", async () => {
  const before = exchanges;
  const response = await GET(new Request("https://autolist.co.ke/auth/callback?flow=signup&code=sample-code&next=%2Fregister%2Fdealer"));
  assert.equal(response.headers.get("location"), "https://autolist.co.ke/login?verification=complete&next=%2Fregister%2Fdealer");
  assert.equal(exchanges, before);
});
