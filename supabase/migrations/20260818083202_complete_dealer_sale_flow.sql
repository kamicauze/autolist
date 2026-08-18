alter table public.listings
  add column if not exists sale_channel text not null default 'standard';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_sale_channel_check'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_sale_channel_check
      check (sale_channel in ('standard', 'dealer_public', 'dealer_only'));
  end if;
end
$$;

create index if not exists idx_listings_dealer_sale_channel_status
  on public.listings(sale_channel, status, updated_at desc)
  where sale_channel in ('dealer_public', 'dealer_only');

drop policy if exists "Active listings are public." on public.listings;
drop policy if exists "Active marketplace listings are public." on public.listings;
create policy "Active marketplace listings are public."
  on public.listings
  for select
  to anon, authenticated
  using (
    status = 'active'
    and sale_channel <> 'dealer_only'
  );

drop policy if exists "Approved dealers view open dealer sale listings." on public.listings;
create policy "Approved dealers view open dealer sale listings."
  on public.listings
  for select
  to authenticated
  using (
    status in ('pending', 'active')
    and sale_channel in ('dealer_public', 'dealer_only')
    and seller_id <> (select auth.uid())
    and exists (
      select 1
      from public.dealers
      where dealers.profile_id = (select auth.uid())
        and dealers.status = 'APPROVED'
    )
  );

drop policy if exists "Approved dealers view dealer sale listing images." on public.listing_images;
create policy "Approved dealers view dealer sale listing images."
  on public.listing_images
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = listing_images.listing_id
        and listings.status in ('pending', 'active')
        and listings.sale_channel in ('dealer_public', 'dealer_only')
        and listings.seller_id <> (select auth.uid())
        and exists (
          select 1
          from public.dealers
          where dealers.profile_id = (select auth.uid())
            and dealers.status = 'APPROVED'
        )
    )
  );

drop policy if exists "Offer settings visible to sellers staff and approved dealers." on public.listing_offer_settings;
create policy "Offer settings visible to sellers staff and approved dealers."
  on public.listing_offer_settings
  for select
  to authenticated
  using (
    public.is_staff((select auth.uid()))
    or seller_id = (select auth.uid())
    or (
      is_enabled
      and (expires_at is null or expires_at > timezone('utc'::text, now()))
      and exists (
        select 1
        from public.dealers
        where dealers.profile_id = (select auth.uid())
          and dealers.status = 'APPROVED'
      )
      and exists (
        select 1
        from public.listings
        where listings.id = listing_offer_settings.listing_id
          and listings.seller_id <> (select auth.uid())
          and (
            listings.status = 'active'
            or (
              listings.status = 'pending'
              and listings.sale_channel in ('dealer_public', 'dealer_only')
            )
          )
      )
    )
  );

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
  select id, seller_id, status, sale_channel, currency
  into listing_record
  from public.listings
  where id = p_listing_id;

  if listing_record.id is null then
    raise exception 'Listing not found.';
  end if;

  if not (
    listing_record.status = 'active'
    or (
      listing_record.status = 'pending'
      and listing_record.sale_channel in ('dealer_public', 'dealer_only')
    )
  ) then
    raise exception 'Offers are not available for this listing.';
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

  if settings_record.expires_at is not null
    and settings_record.expires_at <= timezone('utc'::text, now()) then
    raise exception 'Offers are no longer open for this listing.';
  end if;

  if settings_record.minimum_offer_amount is not null
    and p_amount < settings_record.minimum_offer_amount then
    raise exception 'Offer is below the seller minimum.';
  end if;

  return query select
    listing_record.seller_id,
    dealer_record.profile_id,
    coalesce(nullif(settings_record.currency, ''), listing_record.currency, 'KES');
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
  listing_status text;
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

  select status
  into listing_status
  from public.listings
  where id = previous_offer.listing_id
    and seller_id = actor_id
  for update;

  if listing_status not in ('pending', 'active') then
    raise exception 'Listing is no longer open for offers.';
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
    jsonb_build_object(
      'reason', 'another_offer_accepted',
      'accepted_offer_id', updated_offer.id
    )
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
    and status in ('pending', 'active');

  return updated_offer;
end;
$$;

revoke all on function public.assert_listing_offer_insertable(uuid, uuid, numeric) from public, anon;
revoke all on function public.create_listing_offer(uuid, numeric, text, timestamp with time zone) from public, anon;
revoke all on function public.counter_listing_offer(uuid, numeric, text) from public, anon;
revoke all on function public.accept_listing_offer(uuid) from public, anon;
revoke all on function public.reject_listing_offer(uuid, text) from public, anon;
revoke all on function public.withdraw_listing_offer(uuid) from public, anon;

grant execute on function public.assert_listing_offer_insertable(uuid, uuid, numeric) to authenticated;
grant execute on function public.create_listing_offer(uuid, numeric, text, timestamp with time zone) to authenticated;
grant execute on function public.counter_listing_offer(uuid, numeric, text) to authenticated;
grant execute on function public.accept_listing_offer(uuid) to authenticated;
grant execute on function public.reject_listing_offer(uuid, text) to authenticated;
grant execute on function public.withdraw_listing_offer(uuid) to authenticated;
