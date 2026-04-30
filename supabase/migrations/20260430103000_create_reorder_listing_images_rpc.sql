create or replace function public.reorder_listing_images(
  target_listing_id uuid,
  ordered_r2_keys text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  provided_count integer := coalesce(array_length(ordered_r2_keys, 1), 0);
  distinct_count integer;
  existing_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if provided_count = 0 then
    raise exception 'At least one image is required.';
  end if;

  if not exists (
    select 1
    from public.listings
    where id = target_listing_id
      and seller_id = auth.uid()
  ) then
    raise exception 'Listing not found or not editable.';
  end if;

  select count(distinct key_value)
  into distinct_count
  from unnest(ordered_r2_keys) as ordered(key_value);

  if distinct_count <> provided_count then
    raise exception 'Image order contains duplicate images.';
  end if;

  select count(*)
  into existing_count
  from public.listing_images
  where listing_id = target_listing_id;

  if existing_count <> provided_count then
    raise exception 'Image order must include every listing image.';
  end if;

  if exists (
    select 1
    from unnest(ordered_r2_keys) as ordered(key_value)
    where not exists (
      select 1
      from public.listing_images image
      where image.listing_id = target_listing_id
        and image.r2_key = ordered.key_value
    )
  ) then
    raise exception 'Image order contains an image that does not belong to this listing.';
  end if;

  update public.listing_images image
  set image_order = (ordered.ordinality - 1)::integer
  from unnest(ordered_r2_keys) with ordinality as ordered(key_value, ordinality)
  where image.listing_id = target_listing_id
    and image.r2_key = ordered.key_value;
end;
$$;

revoke all on function public.reorder_listing_images(uuid, text[]) from public;
grant execute on function public.reorder_listing_images(uuid, text[]) to authenticated;
