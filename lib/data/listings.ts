import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingFilters, ListingSort } from "@/lib/types/listing";



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
    .eq("is_featured", true)
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

  // Handle array or single value for bodyType
  if (filters?.bodyType) {
    if (Array.isArray(filters.bodyType) && filters.bodyType.length > 0) {
      query = query.in("body_type", filters.bodyType);
    } else if (typeof filters.bodyType === "string") {
      query = query.eq("body_type", filters.bodyType);
    }
  }

  // Handle array or single value for transmission
  if (filters?.transmission) {
    if (Array.isArray(filters.transmission) && filters.transmission.length > 0) {
      query = query.in("transmission", filters.transmission);
    } else if (typeof filters.transmission === "string") {
      query = query.eq("transmission", filters.transmission);
    }
  }

  // Handle array or single value for fuelType
  if (filters?.fuelType) {
    if (Array.isArray(filters.fuelType) && filters.fuelType.length > 0) {
      query = query.in("fuel_type", filters.fuelType);
    } else if (typeof filters.fuelType === "string") {
      query = query.eq("fuel_type", filters.fuelType);
    }
  }

  if (filters?.condition) {
    query = query.eq("condition", filters.condition);
  }

  // Mileage filters
  if (filters?.minMileage) {
    query = query.gte("mileage", filters.minMileage);
  }
  if (filters?.maxMileage) {
    query = query.lte("mileage", filters.maxMileage);
  }

  // Seller type filter (dealer has dealer_id, private doesn't)
  if (filters?.sellerType === "dealer") {
    query = query.not("dealer_id", "is", null);
  } else if (filters?.sellerType === "private") {
    query = query.is("dealer_id", null);
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

export async function countMatchingListings(
  filters?: ListingFilters
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
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

  // Handle array or single value for bodyType
  if (filters?.bodyType) {
    if (Array.isArray(filters.bodyType) && filters.bodyType.length > 0) {
      query = query.in("body_type", filters.bodyType);
    } else if (typeof filters.bodyType === "string") {
      query = query.eq("body_type", filters.bodyType);
    }
  }

  // Handle array or single value for transmission
  if (filters?.transmission) {
    if (Array.isArray(filters.transmission) && filters.transmission.length > 0) {
      query = query.in("transmission", filters.transmission);
    } else if (typeof filters.transmission === "string") {
      query = query.eq("transmission", filters.transmission);
    }
  }

  // Handle array or single value for fuelType
  if (filters?.fuelType) {
    if (Array.isArray(filters.fuelType) && filters.fuelType.length > 0) {
      query = query.in("fuel_type", filters.fuelType);
    } else if (typeof filters.fuelType === "string") {
      query = query.eq("fuel_type", filters.fuelType);
    }
  }

  if (filters?.condition) {
    query = query.eq("condition", filters.condition);
  }

  // Mileage filters
  if (filters?.minMileage) {
    query = query.gte("mileage", filters.minMileage);
  }
  if (filters?.maxMileage) {
    query = query.lte("mileage", filters.maxMileage);
  }

  // Seller type filter
  if (filters?.sellerType === "dealer") {
    query = query.not("dealer_id", "is", null);
  } else if (filters?.sellerType === "private") {
    query = query.is("dealer_id", null);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting listings:", error);
    return 0;
  }

  return count || 0;
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
