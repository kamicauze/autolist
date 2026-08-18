import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildListingTitle, emitNotificationEvent } from "@/lib/server/notifications";
import type { ListingCategory } from "@/lib/constants/marketplace";
import type {
  ListingAlertCriteria,
  ListingAlertMatchType,
} from "@/lib/types/listing-alerts";
import {
  getListingAlertCategory,
  listingMatchesAlert,
  type ListingAlertMatchableListing,
  type MatchableListingAlert,
} from "@/lib/utils/listing-alerts";
import { buildListingAlertNotification } from "@/lib/utils/listing-alert-notification";

type ListingAlertJobRow = {
  id: string;
  listing_id: string;
  event_kind: ListingAlertMatchType;
  previous_price: number | string | null;
  current_price: number | string;
  status: "queued" | "failed";
  attempt_count: number;
};

type ListingAlertRow = {
  id: string;
  user_id: string;
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
};

function optionalNumber(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMatchableAlert(row: ListingAlertRow): MatchableListingAlert {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    make: row.make,
    model: row.model,
    location: row.location,
    minYear: row.min_year,
    maxYear: row.max_year,
    minPrice: optionalNumber(row.min_price),
    maxPrice: optionalNumber(row.max_price),
    criteria:
      row.criteria && typeof row.criteria === "object" && !Array.isArray(row.criteria)
        ? (row.criteria as ListingAlertCriteria)
        : {},
    emailEnabled: row.email_enabled,
    priceDropEnabled: row.price_drop_enabled,
  };
}

async function markJob(
  jobId: string,
  values: {
    status: "completed" | "failed";
    claimed_at: null;
    last_error: string | null;
    processed_at: string | null;
  }
) {
  const supabase = createAdminClient();
  await supabase.from("listing_alert_jobs").update(values).eq("id", jobId);
}

async function ensureAlertMatch(input: {
  alertId: string;
  listingId: string;
  matchKey: string;
  matchType: ListingAlertMatchType;
  listingPrice: number;
}) {
  const supabase = createAdminClient();
  const { data: inserted, error: insertError } = await supabase
    .from("listing_alert_matches")
    .upsert(
      {
        alert_id: input.alertId,
        listing_id: input.listingId,
        match_key: input.matchKey,
        match_type: input.matchType,
        listing_price: input.listingPrice,
      },
      { onConflict: "alert_id,match_key", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle<{ id: string }>();

  if (insertError) throw new Error(insertError.message);
  if (inserted) return inserted.id;

  const { data: existing, error: existingError } = await supabase
    .from("listing_alert_matches")
    .select("id")
    .eq("alert_id", input.alertId)
    .eq("match_key", input.matchKey)
    .maybeSingle<{ id: string }>();

  if (existingError || !existing) {
    throw new Error(existingError?.message || "Unable to record the listing alert match.");
  }
  return existing.id;
}

async function processListingAlertJob(job: ListingAlertJobRow) {
  const supabase = createAdminClient();
  const attempts = job.attempt_count + 1;
  const { data: claimed, error: claimError } = await supabase
    .from("listing_alert_jobs")
    .update({
      status: "processing",
      attempt_count: attempts,
      claimed_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", job.id)
    .eq("status", job.status)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (claimError) throw new Error(claimError.message);
  if (!claimed) return { matched: 0, skipped: true };

  try {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select(
        "id, status, sale_channel, make, model, year, price, body_type, fuel_type, seats, description, metadata"
      )
      .eq("id", job.listing_id)
      .maybeSingle<ListingAlertMatchableListing>();

    if (listingError) throw new Error(listingError.message);
    if (!listing || listing.status !== "active" || listing.sale_channel === "dealer_only") {
      await markJob(job.id, {
        status: "completed",
        claimed_at: null,
        last_error: null,
        processed_at: new Date().toISOString(),
      });
      return { matched: 0, skipped: true };
    }

    const category = getListingAlertCategory(listing);
    const { data: alertRows, error: alertsError } = await supabase
      .from("listing_alerts")
      .select(
        "id, user_id, category, make, model, location, min_year, max_year, min_price, max_price, criteria, email_enabled, price_drop_enabled"
      )
      .eq("status", "active")
      .eq("category", category)
      .returns<ListingAlertRow[]>();

    if (alertsError) throw new Error(alertsError.message);

    const listingPrice = Number(listing.price);
    const previousPrice = optionalNumber(job.previous_price);
    const listingTitle = buildListingTitle(listing);
    let matched = 0;

    for (const row of alertRows || []) {
      const alert = toMatchableAlert(row);
      if (!listingMatchesAlert(listing, alert, job.event_kind)) continue;

      const matchKey =
        job.event_kind === "new_listing"
          ? `new:${listing.id}`
          : `price:${listing.id}:${listingPrice}`;
      const matchId = await ensureAlertMatch({
        alertId: alert.id,
        listingId: listing.id,
        matchKey,
        matchType: job.event_kind,
        listingPrice,
      });
      const notification = buildListingAlertNotification({
        alertId: alert.id,
        recipientId: alert.userId,
        listingId: listing.id,
        listingTitle,
        listingPrice,
        previousPrice,
        matchType: job.event_kind,
        emailEnabled: alert.emailEnabled,
      });

      await emitNotificationEvent({
        eventType: "listing_alert_match",
        actorId: null,
        listingId: listing.id,
        alertMatchId: matchId,
        payload: {
          alert_id: alert.id,
          match_type: job.event_kind,
          previous_price: previousPrice,
          current_price: listingPrice,
        },
        deliveries: notification.deliveries,
      });

      await supabase
        .from("listing_alerts")
        .update({ last_matched_at: new Date().toISOString() })
        .eq("id", alert.id);
      matched += 1;
    }

    await markJob(job.id, {
      status: "completed",
      claimed_at: null,
      last_error: null,
      processed_at: new Date().toISOString(),
    });
    return { matched, skipped: false };
  } catch (error) {
    await markJob(job.id, {
      status: "failed",
      claimed_at: null,
      last_error: error instanceof Error ? error.message.slice(0, 1000) : "Unknown alert job error.",
      processed_at: null,
    });
    throw error;
  }
}

export async function processQueuedListingAlertJobs(limit = 25) {
  const supabase = createAdminClient();
  const staleClaimBefore = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from("listing_alert_jobs")
    .update({
      status: "failed",
      claimed_at: null,
      last_error: "Recovered after an interrupted alert processor run.",
    })
    .eq("status", "processing")
    .lt("claimed_at", staleClaimBefore);

  const { data: jobs, error } = await supabase
    .from("listing_alert_jobs")
    .select("id, listing_id, event_kind, previous_price, current_price, status, attempt_count")
    .in("status", ["queued", "failed"])
    .lt("attempt_count", 5)
    .order("created_at", { ascending: true })
    .limit(limit)
    .returns<ListingAlertJobRow[]>();

  if (error) {
    return { processed: 0, matched: 0, failed: 0, skipped: 0, error: error.message };
  }

  let matched = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of jobs || []) {
    try {
      const result = await processListingAlertJob(job);
      matched += result.matched;
      if (result.skipped) skipped += 1;
    } catch {
      failed += 1;
    }
  }

  return { processed: jobs?.length || 0, matched, failed, skipped };
}
