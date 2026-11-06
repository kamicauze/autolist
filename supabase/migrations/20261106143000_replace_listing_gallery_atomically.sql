create function public.replace_listing_gallery(target_listing_id uuid, images jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(images) is distinct from 'array' then
    raise exception 'Listing photos must be an array.';
  end if;
  if jsonb_array_length(images) < 3 then
    raise exception 'At least three listing photos are required.';
  end if;

  -- Serialize replacements for this listing. The caller's listing and image
  -- policies still govern the lock, deletion, and insertion.
  perform 1 from public.listings where id = target_listing_id for no key update;
  if not found then
    raise exception 'Listing not found or not editable.';
  end if;

  delete from public.listing_images where listing_id = target_listing_id;

  insert into public.listing_images (
    listing_id, r2_key, alt_text, image_order, image_hash, perceptual_hash, is_watermarked
  )
  select target_listing_id, image.r2_key, image.alt_text, image.image_order,
    image.image_hash, image.perceptual_hash, true
  from jsonb_to_recordset(images) as image(
    r2_key text, alt_text text, image_order integer, image_hash text, perceptual_hash text
  );
end;
$$;

revoke all on function public.replace_listing_gallery(uuid, jsonb) from public, anon;
grant execute on function public.replace_listing_gallery(uuid, jsonb) to authenticated, service_role;
