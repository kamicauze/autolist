import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const migration = readSource(
  "../../supabase/migrations/20260818085627_create_listing_alerts.sql"
);
const processor = readSource("./listing-alerts.ts");
const notificationEvents = readSource("./notifications.ts");
const processRoute = readSource("../../app/api/notifications/process/route.ts");

test("the alert schema pins ownership, explicit grants, and service-only work queues", () => {
  assert.match(migration, /alter table public\.listing_alerts enable row level security/);
  assert.match(migration, /to authenticated[\s\S]+auth\.uid\(\)[\s\S]+user_id/);
  assert.match(migration, /for update[\s\S]+using[\s\S]+with check/);
  assert.match(
    migration,
    /revoke all on table public\.listing_alert_jobs from anon, authenticated/
  );
  assert.match(migration, /grant all on table public\.listing_alert_jobs to service_role/);
  assert.match(
    migration,
    /revoke all on table public\.listing_alert_matches from anon, authenticated/
  );
  assert.match(migration, /grant select on table public\.listing_alert_matches to authenticated/);
});

test("listing changes enqueue retry-safe public inventory work only", () => {
  assert.match(migration, /unique \(listing_id, event_kind, current_price\)/);
  assert.match(migration, /new\.status = 'active'/);
  assert.match(migration, /new\.price < old\.price/);
  assert.match(migration, /sale_channel[\s\S]+<> 'dealer_only'/);
  assert.match(migration, /on conflict \(listing_id, event_kind, current_price\) do nothing/);
  assert.match(migration, /claimed_at timestamp with time zone/);
  assert.match(processor, /Recovered after an interrupted alert processor run/);
  assert.match(processor, /\.eq\("status", job\.status\)/);
});

test("match, event, and delivery keys make processor retries idempotent", () => {
  assert.match(migration, /unique \(alert_id, match_key\)/);
  assert.match(migration, /unique index idx_notification_events_listing_alert_match_id/);
  assert.match(processor, /onConflict: "alert_id,match_key"/);
  assert.match(notificationEvents, /\.eq\("listing_alert_match_id", input\.alertMatchId\)/);
  assert.match(notificationEvents, /onConflict: "event_id,recipient_id,channel"/);
});

test("the protected notification flush processes alert jobs before channel deliveries", () => {
  assert.match(processRoute, /NOTIFICATION_PROCESS_SECRET/);
  assert.match(processRoute, /processQueuedListingAlertJobs\(\)/);
  assert.match(processRoute, /processQueuedNotificationDeliveries\(\)/);
  assert.ok(
    processRoute.indexOf("processQueuedListingAlertJobs()") <
      processRoute.indexOf("processQueuedNotificationDeliveries()")
  );
});
