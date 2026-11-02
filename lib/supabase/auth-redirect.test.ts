import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getAuthCallbackUrl, getBrowserBaseUrl } from "./auth-redirect";

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
