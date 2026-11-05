import type { Metadata } from "next";

export const SITE_URL = "https://autolist.co.ke";
export const SITE_DESCRIPTION =
  "Find new and used cars, vans, motorbikes and commercial vehicles for sale in Kenya. Compare listings and connect with approved dealers on Autolist.";

export const PRIVATE_SEARCH_PATHS = [
  "/admin", "/dashboard", "/support", "/api", "/auth", "/login",
  "/register", "/forgot-password", "/reset-password", "/notifications",
  "/messages", "/account-deactivated",
];

export function isProductionIndexing() {
  return process.env.VERCEL_ENV === "production";
}

export function isPrivateSearchPath(pathname: string) {
  return PRIVATE_SEARCH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function seoDescription(value: string) {
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export function publicPageMetadata({
  title, description, path, image, noIndex = false,
}: {
  title: string;
  description: string;
  path: string | null;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const url = path ? new URL(path, SITE_URL).toString() : undefined;
  const summary = seoDescription(description);
  const pageTitle = path === "/" ? "Autolist" : `${title} | Autolist`;
  return {
    title: pageTitle,
    description: summary,
    alternates: url ? { canonical: url } : undefined,
    robots: { index: isProductionIndexing() && !noIndex, follow: true },
    openGraph: {
      title: pageTitle, description: summary, url,
      siteName: "Autolist", locale: "en_KE", type: "website",
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: pageTitle, description: summary,
      ...(image ? { images: [image] } : {}),
    },
  };
}
