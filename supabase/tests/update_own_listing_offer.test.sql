-- Run only on a disposable empty PostgreSQL database. All setup rolls back.
\set ON_ERROR_STOP on
begin;
create role anon;
create role authenticated;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create table public.listings(id uuid primary key, seller_id uuid, status text, sale_channel text, currency text);
create table public.dealers(id uuid primary key, profile_id uuid, status text);
create table public.listing_offer_settings(listing_id uuid primary key, is_enabled boolean, expires_at timestamptz, minimum_offer_amount numeric, currency text);
create table public.listing_offers(id uuid primary key, listing_id uuid, seller_id uuid, dealer_id uuid, dealer_profile_id uuid, amount numeric, currency text, message text, status text, expires_at timestamptz, responded_at timestamptz, last_actor_id uuid);
create table public.offer_events(offer_id uuid, listing_id uuid, actor_id uuid, event_type text constraint offer_events_event_type_check check(event_type in ('created','countered','accepted','rejected','withdrawn','expired')), from_status text, to_status text, amount numeric, message text, metadata jsonb);
\ir ../migrations/20260818085502_restrict_legacy_active_listing_policy_for_dealer_only.sql
\ir ../migrations/20261015124339_update_own_dealer_listing_offer.sql
create function pg_temp.expect_error(statement text, expected text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlerrm ~ expected then return; end if;
    raise exception 'Unexpected failure: %', sqlerrm;
  end;
  raise exception 'Expected failure: %', expected;
end $$;
insert into listings values('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','pending','dealer_only','KES');
insert into dealers values('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','APPROVED');
insert into listing_offer_settings values('11111111-1111-4111-8111-111111111111',true,null,1000,'KES');
insert into listing_offers values('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1200,'KES','Initial bid','pending',null,null,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into offer_events(offer_id,event_type,amount,message) values('33333333-3333-4333-8333-333333333333','created',1200,'Initial bid');
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1400,'  Updated bid  ');
do $$ begin
 assert (select amount=1400 and message='Updated bid' and status='pending' from listing_offers), 'Owner update persists on same offer';
 assert (select count(*)=2 from offer_events), 'Existing history retained';
 assert (select metadata->>'previous_amount'='1200' from offer_events where event_type='updated'), 'Prior amount recorded';
 assert not has_function_privilege('anon','public.update_own_listing_offer(uuid,numeric,text)','execute');
 assert has_function_privilege('authenticated','public.update_own_listing_offer(uuid,numeric,text)','execute');
 assert (select proconfig @> array['search_path=""'] from pg_proc where oid='public.update_own_listing_offer(uuid,numeric,text)'::regprocedure), 'Empty search path required';
end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'Only the dealer');
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'Only the dealer');
select set_config('request.jwt.claim.sub','',true);
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'Authentication required');
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',999,null)$$,'seller minimum');
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333','NaN'::numeric,null)$$,'greater than zero');
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',0,null)$$,'greater than zero');
update dealers set status='PENDING';
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'Only approved dealers');
update dealers set status='APPROVED';
update listing_offer_settings set is_enabled=false;
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'not enabled');
update listing_offer_settings set is_enabled=true, expires_at=now()-interval '1 minute';
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'no longer open');
update listing_offer_settings set expires_at=null;
update listing_offers set expires_at=now()-interval '1 minute';
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'bid has expired');
update listing_offers set expires_at=null;
update listings set sale_channel='standard';
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'not available');
update listings set sale_channel='dealer_only',status='reserved';
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'not available');
update listings set status='pending';
update listing_offers set status='accepted';
select pg_temp.expect_error($$select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1500,null)$$,'Only pending or countered');
-- A dealer revision of a seller counter becomes pending again without erasing it.
update listing_offers set status='countered',amount=1700,message='Seller counter',last_actor_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',responded_at=now();
insert into offer_events(offer_id,event_type,amount,message) values('33333333-3333-4333-8333-333333333333','countered',1700,'Seller counter');
select public.update_own_listing_offer('33333333-3333-4333-8333-333333333333',1600,'Revised dealer bid');
do $$ begin
 assert (select status='pending' and amount=1600 and responded_at is null and last_actor_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' from listing_offers);
 assert (select count(*)=1 from offer_events where event_type='countered' and amount=1700 and message='Seller counter'), 'Seller counter history preserved';
 assert (select count(*)=2 from offer_events where event_type='updated'), 'Failed edits create no events';
 assert (select count(*)=1 from listing_offers), 'Editing never creates duplicate offers';
end $$;
rollback;
