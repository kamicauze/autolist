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
  const callbackUrl = new URL("/auth/callback", getBrowserBaseUrl());

  if (nextPath) {
    callbackUrl.searchParams.set("next", nextPath);
  }

  return callbackUrl.toString();
}

export function getPasswordResetUrl() {
  return new URL("/reset-password", getBrowserBaseUrl()).toString();
}
