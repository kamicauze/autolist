create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.listing_offer_settings (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  is_enabled boolean not null default true,
  minimum_offer_amount numeric,
  currency text not null default 'KES',
  expires_at timestamp with time zone,
  seller_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (minimum_offer_amount is null or minimum_offer_amount >= 0)
);

create table if not exists public.listing_offers (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  dealer_id uuid references public.dealers(id) on delete cascade not null,
  dealer_profile_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'KES',
  message text,
  status text not null default 'pending' check (
    status in ('pending', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired')
  ),
  expires_at timestamp with time zone,
  responded_at timestamp with time zone,
  accepted_at timestamp with time zone,
  withdrawn_at timestamp with time zone,
  last_actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.offer_events (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.listing_offers(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null not null,
  event_type text not null check (
    event_type in ('created', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired')
  ),
  from_status text check (
    from_status is null
    or from_status in ('pending', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired')
  ),
  to_status text not null check (
    to_status in ('pending', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired')
  ),
  amount numeric,
  message text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_listing_offer_settings_seller
  on public.listing_offer_settings(seller_id, updated_at desc);

create index if not exists idx_listing_offers_listing_status
  on public.listing_offers(listing_id, status, updated_at desc);

create index if not exists idx_listing_offers_dealer_profile
  on public.listing_offers(dealer_profile_id, updated_at desc);

create index if not exists idx_listing_offers_seller
  on public.listing_offers(seller_id, updated_at desc);

create unique index if not exists idx_listing_offers_one_live_per_dealer
  on public.listing_offers(listing_id, dealer_id)
  where status in ('pending', 'countered');

create index if not exists idx_offer_events_offer_created
  on public.offer_events(offer_id, created_at desc);

drop trigger if exists trg_listing_offer_settings_updated_at on public.listing_offer_settings;
create trigger trg_listing_offer_settings_updated_at
before update on public.listing_offer_settings
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_listing_offers_updated_at on public.listing_offers;
create trigger trg_listing_offers_updated_at
before update on public.listing_offers
for each row execute procedure public.touch_updated_at();

create or replace function public.sync_listing_offer_settings_columns()
returns trigger
language plpgsql
as $$
declare
  resolved_seller_id uuid;
  listing_currency text;
begin
  select seller_id, currency
  into resolved_seller_id, listing_currency
  from public.listings
  where id = new.listing_id;

  if resolved_seller_id is null then
    raise exception 'Listing not found for offer settings.';
  end if;

  new.seller_id := resolved_seller_id;
  new.currency := coalesce(nullif(new.currency, ''), listing_currency, 'KES');

  return new;
end;
$$;

drop trigger if exists trg_sync_listing_offer_settings_columns on public.listing_offer_settings;
create trigger trg_sync_listing_offer_settings_columns
before insert or update on public.listing_offer_settings
for each row execute function public.sync_listing_offer_settings_columns();

create or replace function public.assert_listing_offer_insertable(
  p_listing_id uuid,
  p_dealer_id uuid,
  p_amount numeric
)
returns table (
  seller_id uuid,
  dealer_profile_id uuid,
  currency text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  listing_record record;
  dealer_record record;
  settings_record record;
begin
  select id, seller_id, status, currency
  into listing_record
  from public.listings
  where id = p_listing_id;

  if listing_record.id is null then
    raise exception 'Listing not found.';
  end if;

  if listing_record.status <> 'active' then
    raise exception 'Offers are only available for active listings.';
  end if;

  select id, profile_id, status
  into dealer_record
  from public.dealers
  where id = p_dealer_id;

  if dealer_record.id is null or dealer_record.profile_id <> auth.uid() then
    raise exception 'Dealer profile not found for current user.';
  end if;

  if dealer_record.status <> 'APPROVED' then
    raise exception 'Only approved dealers can create offers.';
  end if;

  if listing_record.seller_id = dealer_record.profile_id then
    raise exception 'Dealers cannot offer on their own listings.';
  end if;

  select *
  into settings_record
  from public.listing_offer_settings
  where listing_offer_settings.listing_id = p_listing_id;

  if settings_record.listing_id is null or settings_record.is_enabled is not true then
    raise exception 'Offers are not enabled for this listing.';
  end if;

  if settings_record.expires_at is not null and settings_record.expires_at <= timezone('utc'::text, now()) then
    raise exception 'Offers are no longer open for this listing.';
  end if;

  if settings_record.minimum_offer_amount is not null and p_amount < settings_record.minimum_offer_amount then
    raise exception 'Offer is below the seller minimum.';
  end if;

  return query select
    listing_record.seller_id,
    dealer_record.profile_id,
    coalesce(nullif(settings_record.currency, ''), listing_record.currency, 'KES');
end;
$$;

create or replace function public.create_listing_offer(
  p_listing_id uuid,
  p_amount numeric,
  p_message text default null,
  p_expires_at timestamp with time zone default null
)
returns public.listing_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  dealer_record record;
  insertable record;
  new_offer public.listing_offers;
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  select id
  into dealer_record
  from public.dealers
  where profile_id = actor_id
    and status = 'APPROVED'
  order by created_at desc
  limit 1;

  if dealer_record.id is null then
    raise exception 'Only approved dealers can create offers.';
  end if;

  select *
  into insertable
  from public.assert_listing_offer_insertable(p_listing_id, dealer_record.id, p_amount);

  insert into public.listing_offers (
    listing_id,
    seller_id,
    dealer_id,
    dealer_profile_id,
    amount,
    currency,
    message,
    expires_at,
    last_actor_id
  )
  values (
    p_listing_id,
    insertable.seller_id,
    dealer_record.id,
    insertable.dealer_profile_id,
    p_amount,
    insertable.currency,
    nullif(trim(p_message), ''),
    p_expires_at,
    actor_id
  )
  returning * into new_offer;

  insert into public.offer_events (
    offer_id,
    listing_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    amount,
    message
  )
  values (
    new_offer.id,
    new_offer.listing_id,
    actor_id,
    'created',
    null,
    new_offer.status,
    new_offer.amount,
    new_offer.message
  );

  return new_offer;
end;
$$;

create or replace function public.counter_listing_offer(
  p_offer_id uuid,
  p_amount numeric,
  p_message text default null
)
returns public.listing_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  previous_offer public.listing_offers;
  updated_offer public.listing_offers;
begin
  select *
  into previous_offer
  from public.listing_offers
  where id = p_offer_id
  for update;

  if previous_offer.id is null then
    raise exception 'Offer not found.';
  end if;

  if actor_id is null or actor_id <> previous_offer.seller_id then
    raise exception 'Only the listing seller can counter this offer.';
  end if;

  if previous_offer.status not in ('pending', 'countered') then
    raise exception 'Only pending or countered offers can be countered.';
  end if;

  if p_amount <= 0 then
    raise exception 'Counter amount must be greater than zero.';
  end if;

  update public.listing_offers
  set
    amount = p_amount,
    message = nullif(trim(p_message), ''),
    status = 'countered',
    responded_at = timezone('utc'::text, now()),
    last_actor_id = actor_id
  where id = p_offer_id
  returning * into updated_offer;

  insert into public.offer_events (
    offer_id,
    listing_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    amount,
    message
  )
  values (
    updated_offer.id,
    updated_offer.listing_id,
    actor_id,
    'countered',
    previous_offer.status,
    updated_offer.status,
    updated_offer.amount,
    updated_offer.message
  );

  return updated_offer;
end;
$$;

create or replace function public.accept_listing_offer(p_offer_id uuid)
returns public.listing_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  listing_is_active boolean;
  previous_offer public.listing_offers;
  updated_offer public.listing_offers;
begin
  select *
  into previous_offer
  from public.listing_offers
  where id = p_offer_id
  for update;

  if previous_offer.id is null then
    raise exception 'Offer not found.';
  end if;

  if actor_id is null or actor_id <> previous_offer.seller_id then
    raise exception 'Only the listing seller can accept this offer.';
  end if;

  if previous_offer.status not in ('pending', 'countered') then
    raise exception 'Only pending or countered offers can be accepted.';
  end if;

  select true
  into listing_is_active
  from public.listings
  where id = previous_offer.listing_id
    and seller_id = actor_id
    and status = 'active'
  for update;

  if listing_is_active is not true then
    raise exception 'Listing is no longer active.';
  end if;

  update public.listing_offers
  set
    status = 'accepted',
    responded_at = timezone('utc'::text, now()),
    accepted_at = timezone('utc'::text, now()),
    last_actor_id = actor_id
  where id = p_offer_id
  returning * into updated_offer;

  with competing_offers as (
    select id, status
    from public.listing_offers
    where listing_id = updated_offer.listing_id
      and id <> updated_offer.id
      and status in ('pending', 'countered')
    for update
  ),
  rejected_offers as (
    update public.listing_offers lo
    set
      status = 'rejected',
      responded_at = timezone('utc'::text, now()),
      last_actor_id = actor_id
    from competing_offers
    where lo.id = competing_offers.id
    returning lo.id, lo.listing_id, lo.amount, competing_offers.status as from_status
  )
  insert into public.offer_events (
    offer_id,
    listing_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    amount,
    metadata
  )
  select
    rejected_offers.id,
    rejected_offers.listing_id,
    actor_id,
    'rejected',
    rejected_offers.from_status,
    'rejected',
    rejected_offers.amount,
    jsonb_build_object('reason', 'another_offer_accepted', 'accepted_offer_id', updated_offer.id)
  from rejected_offers;

  insert into public.offer_events (
    offer_id,
    listing_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    amount
  )
  values (
    updated_offer.id,
    updated_offer.listing_id,
    actor_id,
    'accepted',
    previous_offer.status,
    updated_offer.status,
    updated_offer.amount
  );

  update public.listings
  set status = 'reserved'
  where id = updated_offer.listing_id
    and status = 'active';

  return updated_offer;
end;
$$;

create or replace function public.reject_listing_offer(
  p_offer_id uuid,
  p_message text default null
)
returns public.listing_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  previous_offer public.listing_offers;
  updated_offer public.listing_offers;
begin
  select *
  into previous_offer
  from public.listing_offers
  where id = p_offer_id
  for update;

  if previous_offer.id is null then
    raise exception 'Offer not found.';
  end if;

  if actor_id is null or actor_id <> previous_offer.seller_id then
    raise exception 'Only the listing seller can reject this offer.';
  end if;

  if previous_offer.status not in ('pending', 'countered') then
    raise exception 'Only pending or countered offers can be rejected.';
  end if;

  update public.listing_offers
  set
    status = 'rejected',
    message = coalesce(nullif(trim(p_message), ''), message),
    responded_at = timezone('utc'::text, now()),
    last_actor_id = actor_id
  where id = p_offer_id
  returning * into updated_offer;

  insert into public.offer_events (
    offer_id,
    listing_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    amount,
    message
  )
  values (
    updated_offer.id,
    updated_offer.listing_id,
    actor_id,
    'rejected',
    previous_offer.status,
    updated_offer.status,
    updated_offer.amount,
    nullif(trim(p_message), '')
  );

  return updated_offer;
end;
$$;

create or replace function public.withdraw_listing_offer(p_offer_id uuid)
returns public.listing_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  previous_offer public.listing_offers;
  updated_offer public.listing_offers;
begin
  select *
  into previous_offer
  from public.listing_offers
  where id = p_offer_id
  for update;

  if previous_offer.id is null then
    raise exception 'Offer not found.';
  end if;

  if actor_id is null or actor_id <> previous_offer.dealer_profile_id then
    raise exception 'Only the dealer can withdraw this offer.';
  end if;

  if previous_offer.status not in ('pending', 'countered') then
    raise exception 'Only pending or countered offers can be withdrawn.';
  end if;

  update public.listing_offers
  set
    status = 'withdrawn',
    withdrawn_at = timezone('utc'::text, now()),
    last_actor_id = actor_id
  where id = p_offer_id
  returning * into updated_offer;

  insert into public.offer_events (
    offer_id,
    listing_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    amount
  )
  values (
    updated_offer.id,
    updated_offer.listing_id,
    actor_id,
    'withdrawn',
    previous_offer.status,
    updated_offer.status,
    updated_offer.amount
  );

  return updated_offer;
end;
$$;

alter table public.listing_offer_settings enable row level security;
alter table public.listing_offers enable row level security;
alter table public.offer_events enable row level security;

create policy "Offer settings visible to sellers staff and approved dealers."
on public.listing_offer_settings
for select
using (
  public.is_staff(auth.uid())
  or seller_id = auth.uid()
  or (
    is_enabled
    and (expires_at is null or expires_at > timezone('utc'::text, now()))
    and exists (
      select 1
      from public.dealers
      where dealers.profile_id = auth.uid()
        and dealers.status = 'APPROVED'
    )
    and exists (
      select 1
      from public.listings
      where listings.id = listing_offer_settings.listing_id
        and listings.status = 'active'
        and listings.seller_id <> auth.uid()
    )
  )
);

create policy "Sellers manage own offer settings."
on public.listing_offer_settings
for all
using (seller_id = auth.uid() or public.is_staff(auth.uid()))
with check (seller_id = auth.uid() or public.is_staff(auth.uid()));

create policy "Offer parties and staff can view offers."
on public.listing_offers
for select
using (
  public.is_staff(auth.uid())
  or seller_id = auth.uid()
  or dealer_profile_id = auth.uid()
);

create policy "Offer parties and staff can view offer events."
on public.offer_events
for select
using (
  public.is_staff(auth.uid())
  or exists (
    select 1
    from public.listing_offers
    where listing_offers.id = offer_events.offer_id
      and (
        listing_offers.seller_id = auth.uid()
        or listing_offers.dealer_profile_id = auth.uid()
      )
  )
);
