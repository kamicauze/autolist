import "server-only";
import { requireAdminPage } from "@/lib/admin/guard";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import type { Listing } from "@/lib/types/listing";

export async function getAdminListingPreview(id: string): Promise<Listing | null> {
  // Authenticate before constructing a privileged client. Public listing reads
  // retain their active-status/channel restrictions.
  const { supabase: sessionClient } = await requireAdminPage(
    `/admin/listings/${id}/preview`
  );
  const supabase = createOptionalAdminClient() ?? sessionClient;
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      dealer:dealers(id, name, logo_url, city)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load listing preview: ${error.message}`);
  }

  return data as Listing | null;
}
