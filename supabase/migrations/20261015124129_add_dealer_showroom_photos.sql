-- Public dealership imagery is separate from verification logos, contact photos,
-- and vehicle listing images. Existing dealer owner RLS continues to govern edits.
alter table public.dealers
  add column showroom_photo_keys text[] not null default '{}';

alter table public.dealers
  add constraint dealers_showroom_photos_limit
  check (
    cardinality(showroom_photo_keys) <= 5
    and coalesce(array_ndims(showroom_photo_keys), 1) = 1
    and array_position(showroom_photo_keys, null) is null
    and (
      cardinality(showroom_photo_keys) = 0
      or array_to_string(showroom_photo_keys, ',') ~ (
        '^dealers/' || profile_id::text || '/showroom/[a-f0-9-]+[.]webp'
        || '(,dealers/' || profile_id::text || '/showroom/[a-f0-9-]+[.]webp)*$'
      )
    )
  );

comment on column public.dealers.showroom_photo_keys is
  'Ordered public R2 keys for dealership premises photos; first photo is the profile header.';
