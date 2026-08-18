import { createClient } from "@/lib/supabase/server";
import type { ListingCategory } from "@/lib/constants/marketplace";
import type {
  ListingAlertCriteria,
  ListingAlertRecord,
  ListingAlertsPageData,
  ListingAlertStatus,
} from "@/lib/types/listing-alerts";
import { getListingAlertPriceRange } from "@/lib/utils/listing-alerts";

type ListingAlertRow = {
  id: string;
  user_id: string;
  label: string;
  category: ListingCategory;
  make: string | null;
  model: string | null;
  location: string | null;
  min_year: number | null;
  max_year: number | null;
  min_price: number | string | null;
  max_price: number | string | null;
  criteria: Record<string, unknown> | null;
  email_enabled: boolean;
  price_drop_enabled: boolean;
  status: ListingAlertStatus;
  last_matched_at: string | null;
  created_at: string;
  updated_at: string;
};

function optionalNumber(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCriteria(value: Record<string, unknown> | null): ListingAlertCriteria {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ListingAlertCriteria)
    : {};
}

export function toListingAlertRecord(row: ListingAlertRow): ListingAlertRecord {
  const minPrice = optionalNumber(row.min_price);
  const maxPrice = optionalNumber(row.max_price);

  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    category: row.category,
    make: row.make,
    model: row.model,
    location: row.location,
    minYear: row.min_year,
    maxYear: row.max_year,
    minPrice,
    maxPrice,
    priceRange: getListingAlertPriceRange(minPrice, maxPrice),
    criteria: toCriteria(row.criteria),
    emailEnabled: row.email_enabled,
    priceDropEnabled: row.price_drop_enabled,
    status: row.status,
    lastMatchedAt: row.last_matched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getListingAlertsPageData(): Promise<ListingAlertsPageData> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { viewer: null, alerts: [], error: null };
  }

  const [{ data: profile, error: profileError }, { data: alerts, error: alertsError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", user.id)
        .maybeSingle<{ id: string; email: string | null; full_name: string | null }>(),
      supabase
        .from("listing_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<ListingAlertRow[]>(),
    ]);

  if (profileError || !profile) {
    return {
      viewer: { id: user.id, email: null, fullName: null },
      alerts: [],
      error: profileError?.message || "Your alert profile could not be loaded.",
    };
  }

  return {
    viewer: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
    },
    alerts: alertsError ? [] : (alerts || []).map(toListingAlertRecord),
    error: alertsError?.message || null,
  };
}
