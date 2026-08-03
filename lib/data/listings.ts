import { createClient } from "@/lib/supabase/server";
import type { ListingCategory } from "@/lib/constants/marketplace";
import type { Listing, ListingFilters, ListingSort } from "@/lib/types/listing";
import { inferBodyTypesFromText, normalizeBodyTypeValue } from "@/lib/utils/body-type";
import { getListingMetadataString } from "@/lib/utils/listing-details";
import { getListingDisplayLocation } from "@/lib/utils/vehicle-display";
import { NON_CAR_EQUIPMENT_TYPES_BY_CATEGORY } from "@/lib/constants/non-car-reference-data";
import {
  getIntentScore,
  inferListingDriveTypes,
  normalizeDriveTypeValue,
  getMakesForOrigin,
  getUseCaseScore,
  type SearchDriveType,
} from "@/lib/search/vehicle-ontology";

const LISTING_CATEGORY_VALUES: readonly ListingCategory[] = [
  "car",
  "van",
  "motorbike",
  "truck",
  "plant_construction",
  "farm_agricultural",
];

const VAN_CATEGORY_BODY_TYPES = new Set(["Van", "Pickup", "Bus"]);
const VAN_CATEGORY_PATTERN =
  /\b(van|panel van|passenger van|minibus|pickup|pick up|pick-up|utility vehicle|hiace|serena|voxy|noah)\b/;
const TRUCK_CATEGORY_PATTERN =
  /\b(truck|lorry|canter|actros|scania|tractor unit|prime mover|tipper|rigid truck)\b/;
const MOTORBIKE_CATEGORY_PATTERN =
  /\b(motorbike|motorcycle|scooter|moped|boda|quad|atv|dirt bike|sport bike)\b/;
const PLANT_CONSTRUCTION_CATEGORY_PATTERN =
  /\b(excavator|loader|forklift|telehandler|construction|plant equipment|crane|dozer|grader|roller|compactor|compressor|generator|dumper)\b/;
const FARM_AGRICULTURAL_CATEGORY_PATTERN =
  /\b(farm|agricultural|harvester|plough|tractor\b|cultivator|sprayer|baler)\b/;

export interface SearchListingFilters extends ListingFilters {
  /** Engine size bucket for motorbikes, formatted "min-max" (max optional), e.g. "150-500" or "1000-". */
  engineCc?: string;
  /** Taxonomy category label (matched against metadata.taxonomyCategory), e.g. "Tractors". */
  taxonomyCategory?: string;
  /** Taxonomy subcategory label (matched against metadata.subcategory). */
  taxonomySubcategory?: string;
  /** Hours-used range (plant/farm; matched against metadata.hours_used). */
  minHours?: number;
  maxHours?: number;
}

// Keywords that merely restate the active category (e.g. /search?category=motorbike&q=motorbike).
// The category filter already scopes results; keeping such keywords as ILIKE terms would exclude
// listings that never contain the literal word (e.g. "Yamaha MT-07").
const CATEGORY_REDUNDANT_KEYWORD_TERMS: Record<ListingCategory, readonly string[]> = {
  car: ["car", "cars", "vehicle", "vehicles", "car and van", "cars and vans"],
  van: ["van", "vans"],
  motorbike: [
    "motorbike",
    "motorbikes",
    "motorcycle",
    "motorcycles",
    "bike",
    "bikes",
    "motor bike",
    "motor bikes",
  ],
  truck: ["truck", "trucks", "lorry", "lorries"],
  plant_construction: [
    "plant",
    "construction",
    "plant construction",
    "plant and construction",
    "plant equipment",
    "construction equipment",
    "equipment",
    "machinery",
  ],
  farm_agricultural: [
    "farm",
    "farms",
    "agricultural",
    "agriculture",
    "farm agricultural",
    "farm and agricultural",
    "farm equipment",
    "agricultural equipment",
  ],
};

function isCategoryRedundantKeyword(keyword: string, category?: ListingCategory) {
  if (!category) return false;
  const normalized = keyword
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_/+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return CATEGORY_REDUNDANT_KEYWORD_TERMS[category]?.includes(normalized) ?? false;
}

function parseEngineCcRange(value?: string): { min: number; max?: number } | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d+)\s*-\s*(\d*)$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = match[2] ? Number(match[2]) : undefined;
  if (!Number.isFinite(min)) return null;
  return { min, max };
}

function getListingEngineCc(listing: Listing): number | null {
  const raw =
    getListingMetadataString(listing, "engineCapacity") ??
    getListingMetadataString(listing, "engine_capacity") ??
    getListingMetadataString(listing, "engineDisplacement") ??
    getListingMetadataString(listing, "engine_displacement") ??
    getListingMetadataString(listing, "engineSize") ??
    getListingMetadataString(listing, "engine_size");
  if (!raw) return null;

  const match = raw.toLowerCase().match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  let value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  // Litre-style values ("1.5L", "1.5") are converted to cc.
  if (/\bl\b|litre|liter/.test(raw.toLowerCase()) || value < 20) {
    value *= 1000;
  }
  return value;
}

function listingMatchesEngineCcRange(
  listing: Listing,
  range: { min: number; max?: number } | null
) {
  if (!range) return true;
  const cc = getListingEngineCc(listing);
  if (cc == null) return false;
  if (cc < range.min) return false;
  if (range.max != null && cc > range.max) return false;
  return true;
}

function normalizeTaxonomyLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function listingMatchesTaxonomy(
  listing: Listing,
  taxonomyCategory?: string,
  taxonomySubcategory?: string
) {
  if (taxonomyCategory) {
    const value =
      getListingMetadataString(listing, "taxonomyCategory") ??
      getListingMetadataString(listing, "taxonomy_category");
    if (!value || normalizeTaxonomyLabel(value) !== normalizeTaxonomyLabel(taxonomyCategory)) {
      return false;
    }
  }
  if (taxonomySubcategory) {
    const value =
      getListingMetadataString(listing, "subcategory") ??
      getListingMetadataString(listing, "subCategory");
    if (!value || normalizeTaxonomyLabel(value) !== normalizeTaxonomyLabel(taxonomySubcategory)) {
      return false;
    }
  }
  return true;
}

function getListingHoursUsed(listing: Listing): number | null {
  const raw =
    getListingMetadataString(listing, "hours_used") ??
    getListingMetadataString(listing, "hoursUsed");
  if (!raw) return null;
  const match = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function listingMatchesHoursRange(listing: Listing, minHours?: number, maxHours?: number) {
  if (minHours == null && maxHours == null) return true;
  const hours = getListingHoursUsed(listing);
  if (hours == null) return false;
  if (minHours != null && hours < minHours) return false;
  if (maxHours != null && hours > maxHours) return false;
  return true;
}

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

function parseRequestedValues(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRequestedKeywords(value?: string | string[]) {
  return parseRequestedValues(value);
}

function parseRequestedEquipmentTypes(value?: string | string[]) {
  return parseRequestedValues(value);
}

function parseRequestedDriveTypes(value?: string | string[]) {
  return parseRequestedValues(value)
    .map((item) => normalizeDriveTypeValue(item) ?? item.trim().toUpperCase())
    .filter((item): item is SearchDriveType =>
      item === "FWD" || item === "RWD" || item === "AWD" || item === "4WD"
    );
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

function isListingCategory(value: string): value is ListingCategory {
  return LISTING_CATEGORY_VALUES.includes(value as ListingCategory);
}

function buildListingCategorySearchText(listing: Listing) {
  return [
    listing.make,
    listing.model,
    listing.body_type,
    getListingMetadataString(listing, "category"),
    getListingMetadataString(listing, "vehicleType"),
    getListingMetadataString(listing, "equipmentType"),
    getListingMetadataString(listing, "bodyType"),
    listing.description,
    listing.features?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferListingCategory(listing: Listing): ListingCategory {
  const metadataCategory = getListingMetadataString(listing, "category")?.toLowerCase();
  if (metadataCategory && isListingCategory(metadataCategory)) {
    return metadataCategory;
  }

  const inferredBodyTypes = inferListingBodyTypes(listing);
  if (inferredBodyTypes.some((bodyType) => VAN_CATEGORY_BODY_TYPES.has(bodyType))) {
    return "van";
  }
  if (inferredBodyTypes.includes("Truck")) {
    return "truck";
  }

  const searchText = buildListingCategorySearchText(listing);

  if (TRUCK_CATEGORY_PATTERN.test(searchText)) return "truck";
  if (MOTORBIKE_CATEGORY_PATTERN.test(searchText)) return "motorbike";
  if (PLANT_CONSTRUCTION_CATEGORY_PATTERN.test(searchText)) return "plant_construction";
  if (FARM_AGRICULTURAL_CATEGORY_PATTERN.test(searchText)) return "farm_agricultural";
  if (VAN_CATEGORY_PATTERN.test(searchText)) return "van";

  return "car";
}

function listingMatchesRequestedBodyTypes(listing: Listing, requestedBodyTypes: string[]) {
  if (requestedBodyTypes.length === 0) return true;
  const inferred = inferListingBodyTypes(listing);
  return requestedBodyTypes.some((type) => inferred.includes(type));
}

function listingMatchesRequestedCategory(listing: Listing, requestedCategory?: ListingCategory) {
  if (!requestedCategory) return true;
  if (requestedCategory === "car") {
    const category = inferListingCategory(listing);
    return category === "car" || category === "van";
  }
  return inferListingCategory(listing) === requestedCategory;
}

function normalizeEquipmentTypeValue(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(excavators|bulldozers|loaders|cranes|forklifts|telehandlers|graders|generators|dumpers|compressors|tractors|ploughs|plows|harvesters|balers|cultivators|planters|sprayers|trailers|mowers)\b/g, (match) =>
      match.endsWith("ies") ? `${match.slice(0, -3)}y` : match.slice(0, -1)
    );
}

function getRequestedEquipmentTypeTerms(
  requestedEquipmentTypes: string[],
  category?: ListingCategory
) {
  const options = category ? NON_CAR_EQUIPMENT_TYPES_BY_CATEGORY[category] ?? [] : [];
  const terms = new Set<string>();

  for (const requested of requestedEquipmentTypes) {
    const normalizedRequested = normalizeEquipmentTypeValue(requested);
    if (!normalizedRequested) continue;
    terms.add(normalizedRequested);

    const matchedOption = options.find((option) => {
      const optionTerms = [option.value, option.label, ...(option.aliases ?? [])]
        .map(normalizeEquipmentTypeValue)
        .filter(Boolean);
      return optionTerms.includes(normalizedRequested);
    });

    if (matchedOption) {
      [matchedOption.value, matchedOption.label, ...(matchedOption.aliases ?? [])]
        .map(normalizeEquipmentTypeValue)
        .filter(Boolean)
        .forEach((term) => terms.add(term));
    }
  }

  return Array.from(terms);
}

function listingMatchesRequestedEquipmentTypes(
  listing: Listing,
  requestedEquipmentTypes: string[],
  category?: ListingCategory
) {
  if (requestedEquipmentTypes.length === 0) return true;

  const requestedTerms = getRequestedEquipmentTypeTerms(requestedEquipmentTypes, category);
  if (requestedTerms.length === 0) return true;

  const listingTerms = [
    getListingMetadataString(listing, "equipmentType"),
    getListingMetadataString(listing, "equipment_type"),
    listing.model,
    listing.body_type,
    listing.description,
  ]
    .filter(Boolean)
    .map((value) => normalizeEquipmentTypeValue(String(value)))
    .filter(Boolean);

  return requestedTerms.some((requested) =>
    listingTerms.some((term) => term === requested || term.includes(requested))
  );
}

function listingMatchesVerifiedOnly(listing: Listing, verifiedOnly?: boolean) {
  if (!verifiedOnly) return true;

  // Public dealer joins only resolve for approved/verified dealers, so a joined dealer row
  // is the current trust signal for a verified marketplace listing.
  return Boolean(listing.dealer?.id);
}

function listingMatchesRequestedLocation(listing: Listing, requestedLocations: string[]) {
  if (requestedLocations.length === 0) return true;

  const displayLocation = getListingDisplayLocation(listing, { fallback: "" }).toLowerCase();
  return requestedLocations.some((location) => displayLocation.includes(location.toLowerCase()));
}

function listingMatchesRequestedDriveTypes(listing: Listing, requestedDriveTypes: SearchDriveType[]) {
  if (requestedDriveTypes.length === 0) return true;

  const inferredDriveTypes = inferListingDriveTypes(listing);
  return requestedDriveTypes.some((driveType) => inferredDriveTypes.includes(driveType));
}

function rankListingsForSemanticSearch(
  listings: Listing[],
  requestedUseCase?: string,
  requestedIntents: string[] = []
) {
  if (!requestedUseCase && requestedIntents.length === 0) {
    return listings;
  }

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
  options?: { skipBodyType?: boolean; skipLocation?: boolean; skipDriveType?: boolean }
): TQuery {
  let nextQuery = query;

  const keywordFilters = parseRequestedKeywords(filters?.q)
    .filter((keyword) => !isCategoryRedundantKeyword(keyword, filters?.category))
    .map((keyword) => escapeLike(keyword))
    .filter(Boolean)
    .flatMap((keyword) => [
      `make.ilike.%${keyword}%`,
      `model.ilike.%${keyword}%`,
      `description.ilike.%${keyword}%`,
      `body_type.ilike.%${keyword}%`,
    ]);

  if (keywordFilters.length > 0) {
    nextQuery = nextQuery.or(keywordFilters.join(","));
  }
  if (filters?.make) {
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "make", filters.make);
  }
  if (filters?.origin) {
    const originMakes = getMakesForOrigin(filters.origin);
    if (originMakes.length > 0) {
      nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "make", originMakes);
    }
  }
  if (filters?.model) {
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "model", filters.model);
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
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "dealer.city", filters.location);
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
  if (!options?.skipDriveType && filters?.driveType) {
    nextQuery = applyCaseInsensitiveMultiValueFilter(nextQuery, "drive_type", filters.driveType);
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
    .map((item) => `${column}.ilike.%${escapeLike(item)}%`)
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
      skipDriveType: true,
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
      dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text, social_links)
    `)
    .eq("id", id)
    .eq("status", "active")
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
      dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text, social_links)
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
  filters?: SearchListingFilters;
  sort?: ListingSort;
  page?: number;
  limit?: number;
}): Promise<{ listings: Listing[]; total: number }> {
  const requestedBodyTypes = parseRequestedBodyTypes(filters?.bodyType);
  const requestedEngineCcRange = parseEngineCcRange(filters?.engineCc);
  const requestedEquipmentTypes = parseRequestedEquipmentTypes(filters?.equipmentType);
  const requestedUseCase = filters?.useCase?.trim() || undefined;
  const requestedIntents = parseRequestedIntents(filters?.intent);
  const requestedLocations = parseRequestedValues(filters?.location);
  const requestedDriveTypes = parseRequestedDriveTypes(filters?.driveType);
  const requestedTaxonomyCategory = filters?.taxonomyCategory?.trim() || undefined;
  const requestedTaxonomySubcategory = filters?.taxonomySubcategory?.trim() || undefined;
  const requestedHoursRange = filters?.minHours != null || filters?.maxHours != null;
  const requiresDerivedFiltering =
    requestedUseCase ||
    requestedBodyTypes.length > 0 ||
    requestedEquipmentTypes.length > 0 ||
    requestedIntents.length > 0 ||
    requestedDriveTypes.length > 0 ||
    Boolean(requestedEngineCcRange) ||
    Boolean(requestedTaxonomyCategory) ||
    Boolean(requestedTaxonomySubcategory) ||
    requestedHoursRange ||
    Boolean(filters?.location) ||
    Boolean(filters?.category) ||
    Boolean(filters?.verifiedOnly);

  if (requiresDerivedFiltering) {
    const baseListings = await fetchListingsForDerivedFiltering({ filters, sort });
    if (!baseListings) {
      return { listings: [], total: 0 };
    }

    let processedListings = baseListings;
    if (filters?.category) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedCategory(listing, filters.category)
      );
    }
    if (requestedEquipmentTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedEquipmentTypes(listing, requestedEquipmentTypes, filters?.category)
      );
    }
    if (requestedBodyTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedBodyTypes(listing, requestedBodyTypes)
      );
    }
    if (filters?.verifiedOnly) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesVerifiedOnly(listing, filters.verifiedOnly)
      );
    }
    if (filters?.location) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedLocation(listing, requestedLocations)
      );
    }
    if (requestedDriveTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedDriveTypes(listing, requestedDriveTypes)
      );
    }
    if (requestedEngineCcRange) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesEngineCcRange(listing, requestedEngineCcRange)
      );
    }
    if (requestedTaxonomyCategory || requestedTaxonomySubcategory) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesTaxonomy(listing, requestedTaxonomyCategory, requestedTaxonomySubcategory)
      );
    }
    if (requestedHoursRange) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesHoursRange(listing, filters?.minHours, filters?.maxHours)
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
  filters?: SearchListingFilters
): Promise<number> {
  const requestedBodyTypes = parseRequestedBodyTypes(filters?.bodyType);
  const requestedEngineCcRange = parseEngineCcRange(filters?.engineCc);
  const requestedEquipmentTypes = parseRequestedEquipmentTypes(filters?.equipmentType);
  const requestedUseCase = filters?.useCase?.trim() || undefined;
  const requestedIntents = parseRequestedIntents(filters?.intent);
  const requestedLocations = parseRequestedValues(filters?.location);
  const requestedDriveTypes = parseRequestedDriveTypes(filters?.driveType);
  const requestedTaxonomyCategory = filters?.taxonomyCategory?.trim() || undefined;
  const requestedTaxonomySubcategory = filters?.taxonomySubcategory?.trim() || undefined;
  const requestedHoursRange = filters?.minHours != null || filters?.maxHours != null;
  const requiresDerivedFiltering =
    requestedUseCase ||
    requestedBodyTypes.length > 0 ||
    requestedEquipmentTypes.length > 0 ||
    requestedIntents.length > 0 ||
    requestedDriveTypes.length > 0 ||
    Boolean(requestedEngineCcRange) ||
    Boolean(requestedTaxonomyCategory) ||
    Boolean(requestedTaxonomySubcategory) ||
    requestedHoursRange ||
    Boolean(filters?.location) ||
    Boolean(filters?.category) ||
    Boolean(filters?.verifiedOnly);

  if (requiresDerivedFiltering) {
    const baseListings = await fetchListingsForDerivedFiltering({
      filters,
      sort: { field: "created_at", direction: "desc" },
    });
    if (!baseListings) {
      return 0;
    }

    let processedListings = baseListings;
    if (filters?.category) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedCategory(listing, filters.category)
      );
    }
    if (requestedEquipmentTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedEquipmentTypes(listing, requestedEquipmentTypes, filters?.category)
      );
    }
    if (requestedBodyTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedBodyTypes(listing, requestedBodyTypes)
      );
    }
    if (filters?.verifiedOnly) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesVerifiedOnly(listing, filters.verifiedOnly)
      );
    }
    if (filters?.location) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedLocation(listing, requestedLocations)
      );
    }
    if (requestedDriveTypes.length > 0) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesRequestedDriveTypes(listing, requestedDriveTypes)
      );
    }
    if (requestedEngineCcRange) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesEngineCcRange(listing, requestedEngineCcRange)
      );
    }
    if (requestedTaxonomyCategory || requestedTaxonomySubcategory) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesTaxonomy(listing, requestedTaxonomyCategory, requestedTaxonomySubcategory)
      );
    }
    if (requestedHoursRange) {
      processedListings = processedListings.filter((listing) =>
        listingMatchesHoursRange(listing, filters?.minHours, filters?.maxHours)
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
