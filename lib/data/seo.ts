import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";
import { getSupabasePublicEnv } from "@/lib/supabase/config";
import { SITE_URL } from "@/lib/seo";

export async function getPublicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const { url, anonKey, configured } = getSupabasePublicEnv();
  if (!configured) return [];

  // A sitemap must never inherit an owner's or staff member's session.
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const now = new Date().toISOString();
  const pageSize = 1000;

  async function readEntries(table: "listings" | "dealers" | "content_posts") {
    const entries: MetadataRoute.Sitemap = [];
    for (let offset = 0; ; offset += pageSize) {
      let query = supabase.from(table)
        .select(table === "content_posts" ? "slug, updated_at" : "id, updated_at");
      if (table === "listings") {
        query = query.eq("status", "active").in("sale_channel", ["standard", "dealer_public"]);
      } else if (table === "dealers") {
        query = query.eq("status", "APPROVED");
      } else {
        query = query.eq("status", "published").not("published_at", "is", null).lte("published_at", now);
      }
      const { data, error } = await query.order("id", { ascending: true }).range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Unable to load public sitemap entries from ${table}.`);
      for (const row of data ?? []) {
        const segment = table === "listings" ? "vehicle" : table === "dealers" ? "dealers" : "blog";
        const identifier = "slug" in row ? row.slug : row.id;
        entries.push({
          url: `${SITE_URL}/${segment}/${encodeURIComponent(identifier)}`,
          ...(row.updated_at ? { lastModified: row.updated_at } : {}),
        });
      }
      if ((data?.length ?? 0) < pageSize) return entries;
    }
  }

  return (await Promise.all([
    readEntries("listings"), readEntries("dealers"), readEntries("content_posts"),
  ])).flat();
}
