-- Notify approved dealer owners when an eligible listing first opens for offers.
-- No backfill: existing requests remain available from the dashboard Open bids tab.
alter table public.notification_events
  drop constraint if exists notification_events_event_type_check;
alter table public.notification_events
  add constraint notification_events_event_type_check check (event_type in (
    'new_enquiry', 'new_message', 'ticket_created', 'ticket_assigned',
    'listing_status_changed', 'listing_updated', 'appointment_requested',
    'appointment_status_changed', 'listing_alert_match', 'dealer_request_opened'
  ));

create unique index idx_notification_events_dealer_request_opened
  on public.notification_events (listing_id)
  where event_type = 'dealer_request_opened';

create schema if not exists private;

-- The trigger must insert system-owned notifications across recipient RLS.
-- It has no callable RPC surface: private schema, trigger-only signature, and
-- no EXECUTE grants. Every recipient is selected from approved dealer records.
create or replace function private.notify_open_dealer_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_listing_id uuid;
  request_listing public.listings%rowtype;
  event_id uuid;
  vehicle_title text;
begin
  if TG_TABLE_NAME = 'listings' then
    target_listing_id := new.id;
  else
    target_listing_id := new.listing_id;
  end if;

  select l.* into request_listing
  from public.listings l
  join public.listing_offer_settings s on s.listing_id = l.id
  where l.id = target_listing_id
    and s.is_enabled
    and (s.expires_at is null or s.expires_at > now())
    and (l.status = 'active' or (
      l.status = 'pending' and l.sale_channel in ('dealer_public', 'dealer_only')
    ));

  if not found then return new; end if;

  vehicle_title := concat_ws(' ', request_listing.year, request_listing.make, request_listing.model);

  insert into public.notification_events (event_type, actor_id, listing_id, payload)
  values ('dealer_request_opened', request_listing.seller_id, target_listing_id,
    jsonb_build_object('listing_title', vehicle_title))
  on conflict (listing_id) where event_type = 'dealer_request_opened' do nothing
  returning id into event_id;

  -- An event and its deliveries commit together. Repeated submission, approval,
  -- settings edits, and concurrent updates cannot emit the request twice.
  if event_id is null then return new; end if;

  insert into public.notification_deliveries (
    event_id, recipient_id, channel, status, title, body, href, metadata, delivered_at
  )
  select event_id, d.profile_id, 'in_app', 'sent', 'New vehicle open for offers',
    vehicle_title || ' is available. Review the photos and seller details before making an offer.',
    '/dashboard/listings?view=available-bids',
    jsonb_build_object('listing_id', target_listing_id), now()
  from (
    select distinct profile_id from public.dealers
    where status = 'APPROVED' and profile_id <> request_listing.seller_id
  ) d;

  return new;
end;
$$;

revoke all on function private.notify_open_dealer_request() from public, anon, authenticated;

create trigger notify_dealer_request_on_listing_open
  after insert or update of status, sale_channel on public.listings
  for each row execute function private.notify_open_dealer_request();

create trigger notify_dealer_request_on_offers_enabled
  after insert or update of is_enabled, expires_at on public.listing_offer_settings
  for each row execute function private.notify_open_dealer_request();
