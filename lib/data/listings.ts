import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingFilters, ListingSort } from "@/lib/types/listing";

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getImageUrl(r2Key: string): string {
  if (!r2Key) return "/placeholder-car.jpg";
  if (r2Key.startsWith("http")) return r2Key;
  return `${R2_PUBLIC_URL}/${r2Key}`;
}

export async function getFeaturedListings(limit = 8): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      dealer:dealers(id, name, logo_url, city)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured listings:", error);
    return [];
  }

  return data as Listing[];
}

export async function getNewestListings(limit = 8): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      dealer:dealers(id, name, logo_url, city)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching newest listings:", error);
    return [];
  }

  return data as Listing[];
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching listing:", error);
    return null;
  }

  return data as Listing;
}

export async function searchListings({
  filters,
  sort = { field: "created_at", direction: "desc" },
  page = 1,
  limit = 12,
}: {
  filters?: ListingFilters;
  sort?: ListingSort;
  page?: number;
  limit?: number;
}): Promise<{ listings: Listing[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      `
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      dealer:dealers(id, name, logo_url, city)
    `,
      { count: "exact" }
    )
    .eq("status", "active");

  // Apply filters
  if (filters?.make) {
    query = query.ilike("make", `%${filters.make}%`);
  }
  if (filters?.model) {
    query = query.ilike("model", `%${filters.model}%`);
  }
  if (filters?.minPrice) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }
  if (filters?.minYear) {
    query = query.gte("year", filters.minYear);
  }
  if (filters?.maxYear) {
    query = query.lte("year", filters.maxYear);
  }
  if (filters?.bodyType) {
    query = query.eq("body_type", filters.bodyType);
  }
  if (filters?.transmission) {
    query = query.eq("transmission", filters.transmission);
  }
  if (filters?.fuelType) {
    query = query.eq("fuel_type", filters.fuelType);
  }
  if (filters?.condition) {
    query = query.eq("condition", filters.condition);
  }

  // Apply sorting
  query = query.order(sort.field, { ascending: sort.direction === "asc" });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error searching listings:", error);
    return { listings: [], total: 0 };
  }

  return {
    listings: data as Listing[],
    total: count || 0,
  };
}

export async function getSimilarListings(
  listing: Listing,
  limit = 4
): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url)
    `)
    .eq("status", "active")
    .neq("id", listing.id)
    .or(`make.eq.${listing.make},body_type.eq.${listing.body_type}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching similar listings:", error);
    return [];
  }

  return data as Listing[];
}
