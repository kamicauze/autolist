-- Run only against an empty disposable PostgreSQL database. The CREATE TABLE
-- intentionally fails if a real dealers table exists. Everything rolls back.
\set ON_ERROR_STOP on
begin;
create table public.dealers (id uuid primary key, profile_id uuid not null, name text not null);
\ir ../migrations/20261015124129_add_dealer_showroom_photos.sql
insert into public.dealers values ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Sample dealership', default);
do $$
declare
  own_key text := 'dealers/22222222-2222-4222-8222-222222222222/showroom/33333333-3333-4333-8333-333333333333.webp';
  invalid_keys text[];
begin
  if (select showroom_photo_keys <> '{}'::text[] from public.dealers) then
    raise exception 'Existing dealer default must be empty';
  end if;
  update public.dealers set showroom_photo_keys = array[own_key];
  foreach invalid_keys slice 1 in array array[
    array_fill(own_key, array[6]),
    array_fill(null::text, array[6]),
    array_fill('dealers/another-owner/showroom/photo.webp'::text, array[6])
  ] loop
    begin
      update public.dealers set showroom_photo_keys = invalid_keys;
      raise exception 'Invalid photo selection accepted';
    exception when check_violation then null;
    end;
  end loop;
  begin
    update public.dealers set showroom_photo_keys = array['dealers/another-owner/showroom/a.webp'];
    raise exception 'Foreign owner photo accepted';
  exception when check_violation then null;
  end;
  begin
    update public.dealers set showroom_photo_keys = array[null::text];
    raise exception 'Null photo accepted';
  exception when check_violation then null;
  end;
  begin
    update public.dealers set showroom_photo_keys = array['https://example.test/private.png'];
    raise exception 'External photo accepted';
  exception when check_violation then null;
  end;
  update public.dealers set showroom_photo_keys = '{}';
end;
$$;
rollback;
