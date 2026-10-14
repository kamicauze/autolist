-- Run only in a fresh, disposable PostgreSQL database, not an application database.
-- Example: psql -v ON_ERROR_STOP=1 -f supabase/tests/dealer_request_notifications.test.sql
-- Minimal tables exercise the migration without user data or external delivery.
\set ON_ERROR_STOP on
begin;
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
end $$;
create table public.listings (id uuid primary key default gen_random_uuid(), seller_id uuid not null, year integer, make text, model text, status text, sale_channel text);
create table public.listing_offer_settings (listing_id uuid primary key references public.listings, is_enabled boolean, expires_at timestamptz);
create table public.dealers (profile_id uuid, status text);
create table public.notification_events (id uuid primary key default gen_random_uuid(), event_type text, actor_id uuid, listing_id uuid, payload jsonb);
create table public.notification_deliveries (event_id uuid, recipient_id uuid, channel text, status text, title text, body text, href text, metadata jsonb, delivered_at timestamptz, unique(event_id,recipient_id,channel));
\ir ../migrations/20261008085206_dealer_request_notifications.sql
insert into public.dealers values
 ('11111111-1111-1111-1111-111111111111','APPROVED'),
 ('22222222-2222-2222-2222-222222222222','APPROVED'),
 ('33333333-3333-3333-3333-333333333333','PENDING'),
 ('44444444-4444-4444-4444-444444444444','REJECTED');
do $$
declare
  first_request uuid;
  second_request uuid;
  inactive_request uuid;
  expired_request uuid;
  standard_request uuid;
  dealer_owner_request uuid;
  initial_count int;
begin
  insert into listings(seller_id,year,make,model,status,sale_channel) values ('99999999-9999-9999-9999-999999999999',2020,'Toyota','Vitz','draft','dealer_only') returning id into first_request;
  insert into listing_offer_settings values(first_request,true,null);
  assert (select count(*) = 0 from notification_events), 'Drafts must not notify';
  update listings set status='pending' where id=first_request;
  assert (select count(*) = 1 from notification_events), 'Opening a request must create one event';
  assert (select count(*) = 2 from notification_deliveries), 'Only the two approved dealers get deliveries';
  assert not exists(select from notification_deliveries where recipient_id in ('33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444')), 'Non-approved dealers excluded';
  assert (select bool_and(href='/dashboard/listings?view=available-bids') from notification_deliveries), 'Notification opens the bids view';
  update listing_offer_settings set is_enabled=true where listing_id=first_request;
  update listings set status='active' where id=first_request;
  update listing_offer_settings set is_enabled=false where listing_id=first_request;
  update listing_offer_settings set is_enabled=true where listing_id=first_request;
  assert (select count(*) = 1 from notification_events), 'Submission/approval/re-enable retries do not duplicate events';
  assert (select count(*) = 2 from notification_deliveries), 'Retries do not duplicate delivery';

  insert into listings(seller_id,year,make,model,status,sale_channel) values ('99999999-9999-9999-9999-999999999999',2022,'Nissan','Note','pending','dealer_public') returning id into second_request;
  insert into listing_offer_settings values(second_request,false,null);
  assert (select count(*)=1 from notification_events), 'Disabled settings do not notify';
  update listing_offer_settings set is_enabled=true where listing_id=second_request;
  assert (select count(*)=2 from notification_events), 'Status-first then enable also notifies';

  insert into listings(seller_id,status,sale_channel) values ('99999999-9999-9999-9999-999999999999','reserved','dealer_only') returning id into inactive_request;
  insert into listing_offer_settings values(inactive_request,true,null);
  assert (select count(*)=2 from notification_events), 'Reserved requests do not notify';
  insert into listings(seller_id,status,sale_channel) values ('99999999-9999-9999-9999-999999999999','pending','dealer_only') returning id into expired_request;
  insert into listing_offer_settings values(expired_request,true,now()-interval '1 day');
  assert (select count(*)=2 from notification_events), 'Expired requests do not notify';
  update listing_offer_settings set expires_at=now()+interval '1 day' where listing_id=expired_request;
  assert (select count(*)=3 from notification_events), 'Newly eligible extended deadline notifies';
  insert into listings(seller_id,status,sale_channel) values ('99999999-9999-9999-9999-999999999999','pending','standard') returning id into standard_request;
  insert into listing_offer_settings values(standard_request,true,null);
  assert (select count(*)=3 from notification_events), 'Pending public standard listings not eligible';
  update listings set status='active' where id=standard_request;
  assert (select count(*)=4 from notification_events), 'Active public listing with enabled offers eligible';

  insert into listings(seller_id,status,sale_channel) values ('11111111-1111-1111-1111-111111111111','pending','dealer_only') returning id into dealer_owner_request;
  insert into listing_offer_settings values(dealer_owner_request,true,null);
  assert (select count(*)=1 from notification_deliveries where (metadata->>'listing_id')::uuid=dealer_owner_request), 'Dealer owner excluded from own request';
  assert not exists(select from notification_deliveries where (metadata->>'listing_id')::uuid=dealer_owner_request and recipient_id='11111111-1111-1111-1111-111111111111'), 'No self-notification';
  assert not has_function_privilege('anon','private.notify_open_dealer_request()','EXECUTE'), 'Anonymous cannot invoke trigger';
  assert not has_function_privilege('authenticated','private.notify_open_dealer_request()','EXECUTE'), 'Authenticated cannot invoke trigger';
  raise notice 'PASS: status ordering, recipient eligibility, expiry, owner exclusion, idempotency, and trigger privileges';
end $$;

rollback;
