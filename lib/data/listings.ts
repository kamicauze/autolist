import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingFilters, ListingSort } from "@/lib/types/listing";
import {
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

const BODY_TYPE_SYNONYMS: Record<string, string[]> = {
  Sedan: [
    "sedan",
    "saloon",
    "premio",
    "allion",
    "axio",
    "corolla",
    "civic",
    "mark x",
    "jetta",
    "passat",
    "s60",
    "c200",
    "e200",
    "3 series",
    "5 series",
    "a4",
    "a6",
  ],
  SUV: [
    "suv",
    "4x4",
    "prado",
    "land cruiser",
    "forester",
    "cx-5",
    "cx5",
    "x-trail",
    "xtrail",
    "sportage",
    "harrier",
    "x5",
    "q8",
    "fortuner",
    "sorento",
  ],
  Crossover: ["crossover", "forester", "cx-5", "cx5", "qashqai", "x-trail", "xtrail", "vezel", "sportage"],
  Hatchback: ["hatchback", "demio", "fit", "march", "vitz", "note", "a1", "polo", "swift", "passo", "yaris"],
  Pickup: ["pickup", "pick up", "pick-up", "hilux", "d-max", "dmax", "ranger", "navara", "amarok"],
  Wagon: ["wagon", "estate", "fielder", "outback"],
  Van: ["van", "hiace", "serena", "voxy", "noah"],
  Truck: ["truck", "canter", "actros", "scania"],
  Coupe: ["coupe", "86", "mustang"],
  Convertible: ["convertible", "cabriolet", "roadster"],
};

function normalizeBodyTypeValue(value: string) {
  const lower = value.trim().toLowerCase();
  if (!lower) return null;
  if (lower === "saloon") return "Sedan";
  if (lower === "estate") return "Wagon";
  if (lower === "pick up" || lower === "pick-up") return "Pickup";
  if (lower === "4x4") return "SUV";
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function parseRequestedBodyTypes(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => normalizeBodyTypeValue(item))
    .filter((item): item is string => Boolean(item));
}

function inferBodyTypesFromText(text: string) {
  const normalized = ` ${text.toLowerCase()} `;
  const matches = new Set<string>();

  Object.entries(BODY_TYPE_SYNONYMS).forEach(([bodyType, terms]) => {
    if (terms.some((term) => normalized.includes(` ${term} `))) {
      matches.add(bodyType);
    }
  });

  if (matches.has("Crossover")) matches.add("SUV");
  if (matches.has("SUV") && normalized.includes(" crossover ")) matches.add("Crossover");

  return Array.from(matches);
}

function inferListingBodyTypes(listing: Listing) {
  const explicit = listing.body_type ? [normalizeBodyTypeValue(listing.body_type)].filter(Boolean) : [];
  const inferred = inferBodyTypesFromText(
    [
      listing.make,
      listing.model,
      listing.body_type,
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

function rankListingsForUseCase(listings: Listing[], requestedUseCase?: string) {
  if (!requestedUseCase) {
    return listings;
  }

  const minimumScore = getMinimumUseCaseScore(requestedUseCase);

  return listings
    .map((listing) => ({
      listing,
      score: getUseCaseScore(listing, requestedUseCase),
    }))
    .filter((entry) => entry.score >= minimumScore)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
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
  options?: { skipBodyType?: boolean }
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
  if (filters?.location) {
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
  const requestedBodyTypes = parseRequestedBodyTypes(filters?.bodyType);
  const requestedUseCase = filters?.useCase?.trim() || undefined;

  if (requestedUseCase) {
    let rankingQuery = supabase
      .from("listings")
      .select(getListingSelect(Boolean(filters?.location)))
      .eq("status", "active");

    rankingQuery = applyListingFilters(rankingQuery, filters, { skipBodyType: true });
    rankingQuery = rankingQuery.order(sort.field, { ascending: sort.direction === "asc" });
    rankingQuery = rankingQuery.range(0, Math.max(limit * 10, 160) - 1);

    const { data: rankingData, error: rankingError } = await rankingQuery;

    if (rankingError) {
      console.error("Error searching listings with use-case ranking:", rankingError);
      return { listings: [], total: 0 };
    }

    const ranked = rankListingsForUseCase((rankingData || []) as unknown as Listing[], requestedUseCase);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return {
      listings: ranked.slice(from, to + 1),
      total: ranked.length,
    };
  }

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

  const initialListings = (data || []) as unknown as Listing[];
  if ((count || 0) > 0 || requestedBodyTypes.length === 0) {
    return {
      listings: initialListings,
      total: count || 0,
    };
  }

  let fallbackQuery = supabase
    .from("listings")
    .select(getListingSelect(Boolean(filters?.location)))
    .eq("status", "active");

  fallbackQuery = applyListingFilters(fallbackQuery, filters, { skipBodyType: true });
  fallbackQuery = fallbackQuery.order(sort.field, { ascending: sort.direction === "asc" });
  fallbackQuery = fallbackQuery.range(0, Math.max(limit * 8, 120) - 1);

  const { data: fallbackData, error: fallbackError } = await fallbackQuery;
  if (fallbackError) {
    console.error("Error searching listings with body type fallback:", fallbackError);
    return { listings: [], total: 0 };
  }

  const fallbackMatches = ((fallbackData || []) as unknown as Listing[]).filter((listing) =>
    listingMatchesRequestedBodyTypes(listing, requestedBodyTypes)
  );

  return {
    listings: fallbackMatches.slice(from, to + 1),
    total: fallbackMatches.length,
  };
}

export async function countMatchingListings(
  filters?: ListingFilters
): Promise<number> {
  const supabase = await createClient();
  const requestedBodyTypes = parseRequestedBodyTypes(filters?.bodyType);
  const requestedUseCase = filters?.useCase?.trim() || undefined;

  if (requestedUseCase) {
    let rankingQuery = supabase
      .from("listings")
      .select(getListingSelect(Boolean(filters?.location)))
      .eq("status", "active");

    rankingQuery = applyListingFilters(rankingQuery, filters, { skipBodyType: true });
    rankingQuery = rankingQuery.range(0, 499);

    const { data: rankingData, error: rankingError } = await rankingQuery;

    if (rankingError) {
      console.error("Error counting listings with use-case ranking:", rankingError);
      return 0;
    }

    return rankListingsForUseCase((rankingData || []) as unknown as Listing[], requestedUseCase).length;
  }

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

  if ((count || 0) > 0 || requestedBodyTypes.length === 0) {
    return count || 0;
  }

  let fallbackQuery = supabase
    .from("listings")
    .select(getListingSelect(Boolean(filters?.location)))
    .eq("status", "active");

  fallbackQuery = applyListingFilters(fallbackQuery, filters, { skipBodyType: true });
  fallbackQuery = fallbackQuery.range(0, 499);

  const { data: fallbackData, error: fallbackError } = await fallbackQuery;
  if (fallbackError) {
    console.error("Error counting listings with body type fallback:", fallbackError);
    return 0;
  }

  return ((fallbackData || []) as unknown as Listing[]).filter((listing) =>
    listingMatchesRequestedBodyTypes(listing, requestedBodyTypes)
  ).length;
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
