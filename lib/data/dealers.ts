import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types/listing";
import type { DealerProfile } from "@/lib/types/dealer";

const LISTING_SELECT = `
  *,
  images:listing_images(id, r2_key, alt_text, image_order),
  seller:profiles!seller_id(id, full_name, avatar_url),
  dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
`;

export async function getApprovedDealers(limit = 12): Promise<DealerProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dealers:", error);
    return [];
  }

  return (data || []) as DealerProfile[];
}

export async function getDealerById(id: string): Promise<DealerProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("id", id)
    .eq("status", "APPROVED")
    .single();

  if (error) {
    console.error("Error fetching dealer:", error);
    return null;
  }

  return data as DealerProfile;
}

export async function getDealerInventory(
  dealerId: string,
  limit = 8
): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("dealer_id", dealerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dealer inventory:", error);
    return [];
  }

  return (data || []) as Listing[];
}
