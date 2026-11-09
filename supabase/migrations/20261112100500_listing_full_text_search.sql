-- Full-text keyword search for listings (ADR-0073).
--
-- A computed field (function of the row) instead of a stored column keeps the
-- tsvector out of every `select *` listing payload. The function is plain,
-- immutable SQL with no SET clause so the planner inlines it and uses the
-- matching expression index; it is not security definer and references only
-- pg_catalog objects, so a mutable search_path cannot change its behaviour.
-- The app queries it only when LISTING_FULL_TEXT_SEARCH_ENABLED=true.

create or replace function public.listing_search_document(listing public.listings)
returns tsvector
language sql
immutable
parallel safe
as $$
  select pg_catalog.to_tsvector(
    'pg_catalog.english'::regconfig,
    coalesce(listing.make, '') || ' ' ||
    coalesce(listing.model, '') || ' ' ||
    coalesce(listing.year::text, '') || ' ' ||
    coalesce(listing.body_type, '') || ' ' ||
    coalesce(listing.fuel_type, '') || ' ' ||
    coalesce(listing.transmission, '') || ' ' ||
    coalesce(listing.drive_type, '') || ' ' ||
    coalesce(listing.color, '') || ' ' ||
    coalesce(listing.description, '')
  )
$$;

comment on function public.listing_search_document(public.listings) is
  'PostgREST computed field for keyword search: listing_search_document.wfts(english).<query>. Must stay identical to idx_listings_search_document.';

create index if not exists idx_listings_search_document
  on public.listings
  using gin (
    pg_catalog.to_tsvector(
      'pg_catalog.english'::regconfig,
      coalesce(make, '') || ' ' ||
      coalesce(model, '') || ' ' ||
      coalesce(year::text, '') || ' ' ||
      coalesce(body_type, '') || ' ' ||
      coalesce(fuel_type, '') || ' ' ||
      coalesce(transmission, '') || ' ' ||
      coalesce(drive_type, '') || ' ' ||
      coalesce(color, '') || ' ' ||
      coalesce(description, '')
    )
  );

revoke all on function public.listing_search_document(public.listings) from public;
grant execute on function public.listing_search_document(public.listings) to anon, authenticated, service_role;
