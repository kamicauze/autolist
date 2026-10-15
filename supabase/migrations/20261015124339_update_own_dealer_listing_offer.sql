-- Dealer edits retain the offer id and append history; seller counters remain distinct.
alter table public.offer_events drop constraint offer_events_event_type_check;
alter table public.offer_events add constraint offer_events_event_type_check check (
  event_type in ('created', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired', 'updated')
);

create or replace function public.update_own_listing_offer(
  p_offer_id uuid,
  p_amount numeric,
  p_message text default null
)
returns public.listing_offers
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  previous_offer public.listing_offers;
  updated_offer public.listing_offers;
begin
  if actor_id is null then raise exception 'Authentication required.'; end if;
  select * into previous_offer from public.listing_offers where id = p_offer_id for update;
  if previous_offer.id is null then raise exception 'Offer not found.'; end if;
  if previous_offer.dealer_profile_id <> actor_id then
    raise exception 'Only the dealer who submitted this bid can update it.';
  end if;
  if previous_offer.status not in ('pending', 'countered') then
    raise exception 'Only pending or countered bids can be updated.';
  end if;
  if previous_offer.expires_at is not null and previous_offer.expires_at <= now() then
    raise exception 'This bid has expired.';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount::text in ('NaN', 'Infinity', '-Infinity') then
    raise exception 'Enter a bid amount greater than zero.';
  end if;
  -- Hold the rows used by the established create-offer authorization checks.
  perform 1 from public.dealers where id = previous_offer.dealer_id for share;
  perform 1 from public.listings where id = previous_offer.listing_id for share;
  perform 1 from public.listing_offer_settings where listing_id = previous_offer.listing_id for share;
  if exists (select 1 from public.listing_offer_settings
    where listing_id = previous_offer.listing_id and expires_at <= now()) then
    raise exception 'Offers are no longer open for this listing.';
  end if;
  perform * from public.assert_listing_offer_insertable(previous_offer.listing_id, previous_offer.dealer_id, p_amount);

  update public.listing_offers
  set amount = p_amount, message = nullif(trim(p_message), ''), status = 'pending',
      responded_at = null, last_actor_id = actor_id
  where id = previous_offer.id returning * into updated_offer;
  insert into public.offer_events (
    offer_id, listing_id, actor_id, event_type, from_status, to_status, amount, message, metadata
  ) values (
    updated_offer.id, updated_offer.listing_id, actor_id, 'updated', previous_offer.status,
    updated_offer.status, updated_offer.amount, updated_offer.message,
    jsonb_build_object('previous_amount', previous_offer.amount, 'previous_message', previous_offer.message)
  );
  return updated_offer;
end;
$$;

revoke all on function public.update_own_listing_offer(uuid, numeric, text) from public, anon;
grant execute on function public.update_own_listing_offer(uuid, numeric, text) to authenticated;
