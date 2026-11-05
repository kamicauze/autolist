import { sanitizeNextPath } from "./auth-routing";

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  return withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`;
}

export function getBrowserBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_URL?.trim();

  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  if (typeof window !== "undefined") {
    return normalizeBaseUrl(window.location.origin);
  }

  return "http://localhost:3000/";
}

export function getAuthCallbackUrl(nextPath?: string | null) {
  // Keep the callback with the PKCE verifier cookie set by this browser origin.
  const baseUrl =
    typeof window !== "undefined"
      ? normalizeBaseUrl(window.location.origin)
      : getBrowserBaseUrl();
  const callbackUrl = new URL("/auth/callback", baseUrl);

  if (nextPath) {
    callbackUrl.searchParams.set("next", nextPath);
  }

  return callbackUrl.toString();
}

// The PKCE code-verifier cookie only exists on the origin that requested the reset.
export function getPasswordResetUrl() {
  const baseUrl =
    typeof window !== "undefined"
      ? normalizeBaseUrl(window.location.origin)
      : getBrowserBaseUrl();
  return new URL("/reset-password", baseUrl).toString();
}

// Email confirmation is followed by password sign-in, so it works across browsers.
export function getSignupVerificationUrl(nextPath?: string | null) {
  const url = new URL(getAuthCallbackUrl(sanitizeNextPath(nextPath, "")));
  url.searchParams.set("flow", "signup");
  return url.toString();
}

export function cleanVerificationReturn(href: string) {
  const url = new URL(href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  if ([url.searchParams, fragment].some(params => params.has("error") || params.has("error_code"))) {
    url.searchParams.set("verification", "failed");
  }
  // Do not exchange the signup code or retain returned credentials in the URL.
  for (const key of ["code", "error", "error_code", "error_description"]) {
    url.searchParams.delete(key);
  }
  url.hash = "";
  return `${url.pathname}${url.search}`;
}
