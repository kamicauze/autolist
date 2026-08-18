-- A remote-only historical migration left this broader SELECT policy in place.
-- PostgreSQL ORs permissive policies, so it would otherwise expose active
-- dealer-only rows even though the channel-aware public policy excludes them.
drop policy if exists "Listings are viewable by public if active or owner."
  on public.listings;

drop policy if exists "Owners view all their listings."
  on public.listings;

create policy "Owners view all their listings."
  on public.listings
  for select
  to authenticated
  using ((select auth.uid()) = seller_id);

-- Qualify listing columns because this function's RETURNS TABLE names are
-- PL/pgSQL variables and otherwise collide with seller_id/currency.
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
  select
    target_listing.id,
    target_listing.seller_id,
    target_listing.status,
    target_listing.sale_channel,
    target_listing.currency
  into listing_record
  from public.listings as target_listing
  where target_listing.id = p_listing_id;

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

-- This helper is called by create_listing_offer as the function owner. It is
-- not an application RPC and should not be exposed directly through PostgREST.
revoke all on function public.assert_listing_offer_insertable(uuid, uuid, numeric)
  from authenticated;
