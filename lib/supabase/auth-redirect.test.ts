import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanVerificationReturn, getAuthCallbackUrl, getBrowserBaseUrl, getSignupVerificationUrl } from "./auth-redirect";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalVercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  for (const [key, value] of [
    ["NEXT_PUBLIC_SITE_URL", originalSiteUrl],
    ["NEXT_PUBLIC_VERCEL_URL", originalVercelUrl],
  ] as const) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("browser authentication returns to the origin holding its PKCE verifier", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://autolist.co.ke";
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin: "https://autolist-review.vercel.app" } },
  });

  const nextPath = "/dashboard/listings?filter=draft";
  const callback = new URL(getAuthCallbackUrl(nextPath));
  assert.equal(callback.origin, "https://autolist-review.vercel.app");
  assert.equal(callback.pathname, "/auth/callback");
  assert.equal(callback.searchParams.get("next"), nextPath);
  assert.equal(getBrowserBaseUrl(), "https://autolist.co.ke/");
});

test("server authentication keeps the configured site URL", () => {
  Reflect.deleteProperty(globalThis, "window");
  process.env.NEXT_PUBLIC_SITE_URL = "https://autolist.co.ke/";
  assert.equal(getAuthCallbackUrl(), "https://autolist.co.ke/auth/callback");
});

test("server authentication retains Vercel and local fallbacks", () => {
  Reflect.deleteProperty(globalThis, "window");
  delete process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_VERCEL_URL = "autolist-review.vercel.app";
  assert.equal(getAuthCallbackUrl(), "https://autolist-review.vercel.app/auth/callback");
  delete process.env.NEXT_PUBLIC_VERCEL_URL;
  assert.equal(getAuthCallbackUrl(), "http://localhost:3000/auth/callback");
});

test("signup confirmation returns to password login on the requesting browser origin", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true, value: { location: { origin: "https://autolist-review.vercel.app" } },
  });
  const url = new URL(getSignupVerificationUrl("/register/dealer"));
  assert.equal(url.origin, "https://autolist-review.vercel.app");
  assert.equal(url.pathname, "/auth/callback");
  assert.equal(url.searchParams.get("flow"), "signup");
  assert.equal(url.searchParams.get("next"), "/register/dealer");
  assert.equal(new URL(getSignupVerificationUrl("https://outside.example")).searchParams.has("next"), false);
});

test("confirmation returns discard browser-bound codes and implicit tokens without treating them as verification failures", () => {
  for (const suffix of ["&code=signup-code", "#access_token=sample-token&refresh_token=sample-refresh"]) {
    assert.equal(cleanVerificationReturn("https://autolist.co.ke/login?verification=complete&next=%2Fregister%2Fdealer" + suffix),
      "/login?verification=complete&next=%2Fregister%2Fdealer");
  }
});

test("actual provider errors in either return format retain verification recovery", () => {
  for (const suffix of ["&error=access_denied&error_code=otp_expired&error_description=details", "#error=access_denied&error_code=otp_expired"]) {
    assert.equal(cleanVerificationReturn("https://autolist.co.ke/login?verification=complete" + suffix), "/login?verification=failed");
  }
});
