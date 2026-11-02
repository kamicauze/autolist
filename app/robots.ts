import type { MetadataRoute } from "next";
import { isProductionIndexing, PRIVATE_SEARCH_PATHS, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexing()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_SEARCH_PATHS },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
