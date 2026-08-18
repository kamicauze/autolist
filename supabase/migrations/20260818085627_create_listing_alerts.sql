create table public.listing_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  label text not null check (char_length(label) between 1 and 120),
  category text not null check (
    category in (
      'car',
      'van',
      'motorbike',
      'truck',
      'plant_construction',
      'farm_agricultural'
    )
  ),
  make text,
  model text,
  location text,
  min_year integer check (min_year is null or min_year between 1900 and 2200),
  max_year integer check (max_year is null or max_year between 1900 and 2200),
  min_price numeric check (min_price is null or min_price >= 0),
  max_price numeric check (max_price is null or max_price >= 0),
  criteria jsonb not null default '{}'::jsonb check (jsonb_typeof(criteria) = 'object'),
  email_enabled boolean not null default true,
  price_drop_enabled boolean not null default true,
  status text not null default 'active' check (status in ('active', 'paused')),
  last_matched_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (min_year is null or max_year is null or min_year <= max_year),
  check (min_price is null or max_price is null or min_price <= max_price)
);

create index idx_listing_alerts_user_created_at
  on public.listing_alerts(user_id, created_at desc);
create unique index idx_listing_alerts_user_fingerprint
  on public.listing_alerts(user_id, fingerprint);
create index idx_listing_alerts_active_category
  on public.listing_alerts(category, created_at)
  where status = 'active';

alter table public.listing_alerts enable row level security;

revoke all on table public.listing_alerts from anon, authenticated;
grant select, insert, update, delete on table public.listing_alerts to authenticated;
grant all on table public.listing_alerts to service_role;

create policy "Users view own listing alerts"
on public.listing_alerts
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users create own listing alerts"
on public.listing_alerts
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users update own listing alerts"
on public.listing_alerts
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users delete own listing alerts"
on public.listing_alerts
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create function private.set_listing_alert_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

revoke all on function private.set_listing_alert_updated_at() from public, anon, authenticated;
grant execute on function private.set_listing_alert_updated_at() to service_role;

create trigger listing_alerts_set_updated_at
before update on public.listing_alerts
for each row execute function private.set_listing_alert_updated_at();

create table public.listing_alert_matches (
  id uuid default uuid_generate_v4() primary key,
  alert_id uuid references public.listing_alerts(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  match_key text not null,
  match_type text not null check (match_type in ('new_listing', 'price_drop')),
  listing_price numeric not null check (listing_price >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (alert_id, match_key)
);

create index idx_listing_alert_matches_alert_created_at
  on public.listing_alert_matches(alert_id, created_at desc);
create index idx_listing_alert_matches_listing_id
  on public.listing_alert_matches(listing_id);

alter table public.listing_alert_matches enable row level security;

revoke all on table public.listing_alert_matches from anon, authenticated;
grant select on table public.listing_alert_matches to authenticated;
grant all on table public.listing_alert_matches to service_role;

create policy "Users view matches for own listing alerts"
on public.listing_alert_matches
for select
to authenticated
using (
  (select auth.uid()) is not null
  and exists (
    select 1
    from public.listing_alerts
    where listing_alerts.id = listing_alert_matches.alert_id
      and listing_alerts.user_id = (select auth.uid())
  )
);

create table public.listing_alert_jobs (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  event_kind text not null check (event_kind in ('new_listing', 'price_drop')),
  previous_price numeric,
  current_price numeric not null check (current_price >= 0),
  status text not null default 'queued' check (
    status in ('queued', 'processing', 'completed', 'failed')
  ),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  claimed_at timestamp with time zone,
  last_error text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (listing_id, event_kind, current_price)
);

create index idx_listing_alert_jobs_processing
  on public.listing_alert_jobs(status, created_at)
  where status in ('queued', 'failed');

alter table public.listing_alert_jobs enable row level security;

revoke all on table public.listing_alert_jobs from anon, authenticated;
grant all on table public.listing_alert_jobs to service_role;

create function private.enqueue_listing_alert_job()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'active' and coalesce(new.sale_channel, 'standard') <> 'dealer_only' then
      insert into public.listing_alert_jobs (
        listing_id,
        event_kind,
        current_price
      ) values (
        new.id,
        'new_listing',
        new.price
      ) on conflict (listing_id, event_kind, current_price) do nothing;
    end if;

    return new;
  end if;

  if (
    new.status = 'active'
    and old.status is distinct from 'active'
    and coalesce(new.sale_channel, 'standard') <> 'dealer_only'
  ) then
    insert into public.listing_alert_jobs (
      listing_id,
      event_kind,
      current_price
    ) values (
      new.id,
      'new_listing',
      new.price
    ) on conflict (listing_id, event_kind, current_price) do nothing;
  elsif (
    old.status = 'active'
    and new.status = 'active'
    and new.price < old.price
    and coalesce(new.sale_channel, 'standard') <> 'dealer_only'
  ) then
    insert into public.listing_alert_jobs (
      listing_id,
      event_kind,
      previous_price,
      current_price
    ) values (
      new.id,
      'price_drop',
      old.price,
      new.price
    ) on conflict (listing_id, event_kind, current_price) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.enqueue_listing_alert_job() from public, anon, authenticated;
grant execute on function private.enqueue_listing_alert_job() to service_role;

create trigger listings_enqueue_listing_alert_job
after insert or update of status, price on public.listings
for each row execute function private.enqueue_listing_alert_job();

alter table public.notification_events
  add column listing_alert_match_id uuid
  references public.listing_alert_matches(id) on delete cascade;

create unique index idx_notification_events_listing_alert_match_id
  on public.notification_events(listing_alert_match_id)
  where listing_alert_match_id is not null;

alter table public.notification_events
  drop constraint if exists notification_events_event_type_check;

alter table public.notification_events
  add constraint notification_events_event_type_check
  check (
    event_type in (
      'new_enquiry',
      'new_message',
      'ticket_created',
      'ticket_assigned',
      'listing_status_changed',
      'listing_updated',
      'appointment_requested',
      'appointment_status_changed',
      'listing_alert_match'
    )
  );
