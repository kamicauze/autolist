import type { MetadataRoute } from "next";
import { getPublicSitemapEntries } from "@/lib/data/seo";
import { isProductionIndexing, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionIndexing()) return [];
  const pages = ["", "/search", "/dealers", "/blog", "/about", "/faqs", "/how-it-works"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...await getPublicSitemapEntries(),
  ];
}
