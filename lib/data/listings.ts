import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingFilters, ListingSort } from "@/lib/types/listing";

function escapeLike(value: string) {
  return value.replace(/[,%]/g, "");
}

function getListingSelect(includeDealerLocationFilter = false) {
  const dealerJoin = includeDealerLocationFilter
    ? "dealer:dealers!inner(id, name, logo_url, city)"
    : "dealer:dealers(id, name, logo_url, city)";

  return `
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      ${dealerJoin}
    `;
}

function applyCaseInsensitiveMultiValueFilter<TQuery extends { or: (filters: string) => TQuery }>(
  query: TQuery,
  column: string,
  value: string | string[]
) {
  const values = Array.isArray(value) ? value : [value];
  const normalized = values.map((item) => item.trim()).filter(Boolean);

  if (normalized.length === 0) {
    return query;
  }

  const filter = normalized
    .map((item) => `${column}.ilike.${escapeLike(item)}`)
    .join(",");

  return query.or(filter);
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

export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
  const sanitizedIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean))).slice(0, 3);

  if (sanitizedIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      images:listing_images(id, r2_key, alt_text, image_order),
      seller:profiles!seller_id(id, full_name, avatar_url),
      dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
    `)
    .eq("status", "active")
    .in("id", sanitizedIds);

  if (error) {
    console.error("Error fetching listings by ids:", error);
    return [];
  }

  const listings = (data as Listing[]) || [];
  return listings.sort(
    (a, b) => sanitizedIds.indexOf(a.id) - sanitizedIds.indexOf(b.id)
  );
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
    .select(getListingSelect(Boolean(filters?.location)), { count: "exact" })
    .eq("status", "active");

  // Apply filters
  if (filters?.q) {
    query = query.or(
      `make.ilike.%${filters.q}%,model.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    );
  }
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
    query = applyCaseInsensitiveMultiValueFilter(query, "body_type", filters.bodyType);
  }

  // Handle array or single value for transmission
  if (filters?.transmission) {
    query = applyCaseInsensitiveMultiValueFilter(query, "transmission", filters.transmission);
  }

  // Handle array or single value for fuelType
  if (filters?.fuelType) {
    query = applyCaseInsensitiveMultiValueFilter(query, "fuel_type", filters.fuelType);
  }

  if (filters?.condition) {
    if (filters.condition === "locally_used" || filters.condition === "used") {
      query = query.in("condition", ["locally_used", "used"]);
    } else {
      query = query.eq("condition", filters.condition);
    }
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

  if (filters?.location) {
    query = query.ilike("dealer.city", `%${escapeLike(filters.location)}%`);
  }

  // Color filter
  if (filters?.color) {
    query = query.ilike("color", `%${filters.color}%`);
  }

  // Seats filter
  if (filters?.seats) {
    if (filters.seats >= 8) {
      query = query.gte("seats", 8);
    } else {
      query = query.eq("seats", filters.seats);
    }
  }

  // Doors filter
  if (filters?.doors) {
    query = query.eq("doors", filters.doors);
  }

  // Drive type filter
  if (filters?.driveType) {
    query = query.eq("drive_type", filters.driveType);
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
    listings: (data || []) as unknown as Listing[],
    total: count || 0,
  };
}

export async function countMatchingListings(
  filters?: ListingFilters
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(getListingSelect(Boolean(filters?.location)), { count: "exact", head: true })
    .eq("status", "active");

  // Apply filters
  if (filters?.q) {
    query = query.or(
      `make.ilike.%${filters.q}%,model.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    );
  }
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

  if (filters?.condition) {
    if (filters.condition === "locally_used" || filters.condition === "used") {
      query = query.in("condition", ["locally_used", "used"]);
    } else {
      query = query.eq("condition", filters.condition);
    }
  }

  // Handle array or single value for bodyType
  if (filters?.bodyType) {
    query = applyCaseInsensitiveMultiValueFilter(query, "body_type", filters.bodyType);
  }

  // Handle array or single value for transmission
  if (filters?.transmission) {
    query = applyCaseInsensitiveMultiValueFilter(query, "transmission", filters.transmission);
  }

  // Handle array or single value for fuelType
  if (filters?.fuelType) {
    query = applyCaseInsensitiveMultiValueFilter(query, "fuel_type", filters.fuelType);
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

  if (filters?.location) {
    query = query.ilike("dealer.city", `%${escapeLike(filters.location)}%`);
  }

  // Color filter
  if (filters?.color) {
    query = query.ilike("color", `%${filters.color}%`);
  }

  // Seats filter
  if (filters?.seats) {
    if (filters.seats >= 8) {
      query = query.gte("seats", 8);
    } else {
      query = query.eq("seats", filters.seats);
    }
  }

  // Doors filter
  if (filters?.doors) {
    query = query.eq("doors", filters.doors);
  }

  // Drive type filter
  if (filters?.driveType) {
    query = query.eq("drive_type", filters.driveType);
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
