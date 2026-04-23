import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingFilters, ListingSort } from "@/lib/types/listing";
import { inferBodyTypesFromText, normalizeBodyTypeValue } from "@/lib/utils/body-type";
import { getListingMetadataString } from "@/lib/utils/listing-details";
import { getListingDisplayLocation } from "@/lib/utils/vehicle-display";
import {
  getIntentScore,
  getMakesForOrigin,
  getMinimumUseCaseScore,
  getUseCaseScore,
} from "@/lib/search/vehicle-ontology";

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

function parseRequestedBodyTypes(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => normalizeBodyTypeValue(item))
    .filter((item): item is string => Boolean(item));
}

function parseRequestedIntents(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferListingBodyTypes(listing: Listing) {
  const metadataBodyType = getListingMetadataString(listing, "bodyType") ?? getListingMetadataString(listing, "body_type");
  const explicit = [listing.body_type, metadataBodyType]
    .filter(Boolean)
    .map((value) => normalizeBodyTypeValue(String(value)))
    .filter(Boolean);
  const inferred = inferBodyTypesFromText(
    [
      listing.make,
      listing.model,
      listing.body_type,
      metadataBodyType,
      listing.description,
      listing.features?.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return Array.from(new Set([...explicit, ...inferred].filter(Boolean))) as string[];
}

function listingMatchesRequestedBodyTypes(listing: Listing, requestedBodyTypes: string[]) {
  if (requestedBodyTypes.length === 0) return true;
  const inferred = inferListingBodyTypes(listing);
  return requestedBodyTypes.some((type) => inferred.includes(type));
}

function listingMatchesRequestedLocation(listing: Listing, requestedLocation?: string) {
  const normalizedLocation = requestedLocation?.trim().toLowerCase();
  if (!normalizedLocation) return true;

  const displayLocation = getListingDisplayLocation(listing, { fallback: "" }).toLowerCase();
  return displayLocation.includes(normalizedLocation);
}

function rankListingsForSemanticSearch(
  listings: Listing[],
  requestedUseCase?: string,
  requestedIntents: string[] = []
) {
  if (!requestedUseCase && requestedIntents.length === 0) {
    return listings;
  }

  const minimumUseCaseScore = getMinimumUseCaseScore(requestedUseCase);

  return listings
    .map((listing) => {
      const useCaseScore = requestedUseCase ? getUseCaseScore(listing, requestedUseCase) : 0;
      const intentScore = requestedIntents.reduce(
        (total, intent) => total + getIntentScore(listing, intent),
        0
      );

      return {
        listing,
        useCaseScore,
        intentScore,
        score: useCaseScore + intentScore,
      };
    })
    .filter((entry) => !requestedUseCase || entry.useCaseScore >= minimumUseCaseScore)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.intentScore !== a.intentScore) return b.intentScore - a.intentScore;
      return new Date(b.listing.created_at).getTime() - new Date(a.listing.created_at).getTime();
    })
    .map((entry) => entry.listing);
}

interface ListingQuery {
  or(filters: string): this;
  ilike(column: string, value: string): this;
  gte(column: string, value: number): this;
  lte(column: string, value: number): this;
  in(column: string, values: string[]): this;
  eq(column: string, value: string | number): this;
  not(column: string, operator: string, value: string | null): this;
  is(column: string, value: null): this;
}

function applyListingFilters<TQuery extends ListingQuery>(
  query: TQuery,
  filters?: ListingFilters,
  options?: { skipBodyType?: boolean; skipLocation?: boolean }
): TQuery {
  let nextQuery = query;

  if (filters?.q) {
    const broad = escapeLike(filters.q);
    nextQuery = nextQuery.or(
      `make.ilike.%${broad}%,model.ilike.%${broad}%,description.ilike.%${broad}%,body_type.ilike.%${broad}%`
    );
  }
  if (filters?.make) {
    nextQuery = nextQuery.ilike("make", `%${filters.make}%`);
  }
  if (filters?.origin) {
    const originMakes = getMakesForOrigin(filters.origin);
    if (originMakes.length > 0) {
      nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "make", originMakes);
    }
  }
  if (filters?.model) {
    nextQuery = nextQuery.ilike("model", `%${filters.model}%`);
  }
  if (filters?.minPrice) {
    nextQuery = nextQuery.gte("price", filters.minPrice);
  }
  if (filters?.maxPrice) {
    nextQuery = nextQuery.lte("price", filters.maxPrice);
  }
  if (filters?.minYear) {
    nextQuery = nextQuery.gte("year", filters.minYear);
  }
  if (filters?.maxYear) {
    nextQuery = nextQuery.lte("year", filters.maxYear);
  }
  if (!options?.skipBodyType && filters?.bodyType) {
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "body_type", filters.bodyType);
  }
  if (filters?.transmission) {
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "transmission", filters.transmission);
  }
  if (filters?.fuelType) {
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "fuel_type", filters.fuelType);
  }
  if (filters?.condition) {
    if (filters.condition === "locally_used" || filters.condition === "used") {
      nextQuery = nextQuery.in("condition", ["locally_used", "used"]);
    } else {
      nextQuery = nextQuery.eq("condition", filters.condition);
    }
  }
  if (filters?.minMileage) {
    nextQuery = nextQuery.gte("mileage", filters.minMileage);
  }
  if (filters?.maxMileage) {
    nextQuery = nextQuery.lte("mileage", filters.maxMileage);
  }
  if (filters?.sellerType === "dealer") {
    nextQuery = nextQuery.not("dealer_id", "is", null);
  } else if (filters?.sellerType === "private") {
    nextQuery = nextQuery.is("dealer_id", null);
  }
  if (!options?.skipLocation && filters?.location) {
    nextQuery = nextQuery.ilike("dealer.city", `%${escapeLike(filters.location)}%`);
  }
  if (filters?.color) {
    nextQuery = nextQuery.ilike("color", `%${filters.color}%`);
  }
  if (filters?.seats) {
    if (filters.seats >= 8) {
      nextQuery = nextQuery.gte("seats", 8);
    } else {
      nextQuery = nextQuery.eq("seats", filters.seats);
    }
  }
  if (filters?.doors) {
    nextQuery = nextQuery.eq("doors", filters.doors);
  }
  if (filters?.driveType) {
    nextQuery = nextQuery.eq("drive_type", filters.driveType);
  }

  return nextQuery;
}

function applyCaseInsensitiveMultiValueFilter<TQuery extends { or(filters: string): TQuery }>(
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

async function fetchListingsForDerivedFiltering({
  filters,
  sort,
}: {
  filters?: ListingFilters;
  sort: ListingSort;
}) {
  const supabase = await createClient();
  const batchSize = 500;
  const listings: Listing[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from("listings")
      .select(getListingSelect(false))
      .eq("status", "active");

    query = applyListingFilters(query, filters, {
      skipBodyType: true,
      skipLocation: true,
    });
    query = query.order(sort.field, { ascending: sort.direction === "asc" });
    query = query.range(from, from + batchSize - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error searching listings with derived filtering:", error);
      return null;
    }

    const batch = (data || []) as unknown as Listing[];
    listings.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  return listings;
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
  const requestedBodyTypes = parseRequestedBodyTypes(filters?.bodyType);
  const requestedUseCase = filters?.useCase?.trim() || undefined;
  const requestedIntents = parseRequestedIntents(filters?.intent);
  const requiresDerivedFiltering =
    requestedUseCase || requestedBodyTypes.length > 0 || requestedIntents.length > 0 || Boolean(filters?.location);

  if (requiresDerivedFiltering) {
    const baseListings = await fetchListingsForDerivedFiltering({ filters, sort });
    if (!baseListings) {
      return { listings: [], total: 0 };
    }

    let processedListings = baseListings;
    if (requestedBodyTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedBodyTypes(listing, requestedBodyTypes)
      );
    }
    if (filters?.location) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedLocation(listing, filters.location)
      );
    }
    const ranked = rankListingsForSemanticSearch(
      processedListings,
      requestedUseCase,
      requestedIntents
    );
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return {
      listings: ranked.slice(from, to + 1),
      total: ranked.length,
    };
  }

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(getListingSelect(Boolean(filters?.location)), { count: "exact" })
    .eq("status", "active");

  query = applyListingFilters(query, filters);

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
  const requestedBodyTypes = parseRequestedBodyTypes(filters?.bodyType);
  const requestedUseCase = filters?.useCase?.trim() || undefined;
  const requestedIntents = parseRequestedIntents(filters?.intent);
  const requiresDerivedFiltering =
    requestedUseCase || requestedBodyTypes.length > 0 || requestedIntents.length > 0 || Boolean(filters?.location);

  if (requiresDerivedFiltering) {
    const baseListings = await fetchListingsForDerivedFiltering({
      filters,
      sort: { field: "created_at", direction: "desc" },
    });
    if (!baseListings) {
      return 0;
    }

    let processedListings = baseListings;
    if (requestedBodyTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedBodyTypes(listing, requestedBodyTypes)
      );
    }
    if (filters?.location) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedLocation(listing, filters.location)
      );
    }

    return rankListingsForSemanticSearch(
      processedListings,
      requestedUseCase,
      requestedIntents
    ).length;
  }

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(getListingSelect(Boolean(filters?.location)), { count: "exact", head: true })
    .eq("status", "active");
  query = applyListingFilters(query, filters);

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
