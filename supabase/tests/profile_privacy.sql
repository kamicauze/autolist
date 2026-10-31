-- Run only against the offline recovery database. All fixtures roll back.
begin;
do $$
begin
  assert current_database() = 'recovery_check'
    and current_setting('cron.launch_active_jobs', true) = 'off',
    'Run only in the isolated recovery database.';
end;
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('a2ac9849-11d3-47b6-b5a3-b31300000001', 'privacy-owner@example.invalid', '{"full_name":"Privacy owner","intended_role":"seller"}'),
  ('a2ac9849-11d3-47b6-b5a3-b31300000002', 'privacy-buyer@example.invalid', '{"full_name":"Privacy buyer"}'),
  ('a2ac9849-11d3-47b6-b5a3-b31300000003', 'privacy-staff@example.invalid', '{}');
update public.profiles set phone = '+254700000001', address = 'Private account address'
  where id = 'a2ac9849-11d3-47b6-b5a3-b31300000001';
update public.profiles set role = 'support'
  where id = 'a2ac9849-11d3-47b6-b5a3-b31300000003';
insert into public.listings (id, seller_id, status, make, model, year, price) values
  ('a2ac9849-11d3-47b6-b5a3-b31300000004', 'a2ac9849-11d3-47b6-b5a3-b31300000001', 'active', 'Toyota', 'Vitz', 2020, 1000000);
insert into public.enquiries (id, listing_id, user_id, message) values
  ('a2ac9849-11d3-47b6-b5a3-b31300000005', 'a2ac9849-11d3-47b6-b5a3-b31300000004', 'a2ac9849-11d3-47b6-b5a3-b31300000002', 'Private enquiry');

set local role anon;
do $$
begin
  assert not exists(select from public.profiles), 'Anonymous callers read private profiles.';
  assert (select full_name = 'Privacy owner' from public.public_profiles
    where id = 'a2ac9849-11d3-47b6-b5a3-b31300000001'), 'Public name is missing.';
  assert (select array_agg(column_name::text order by ordinal_position) = array['id','full_name','avatar_url']
    from information_schema.columns where table_schema='public' and table_name='public_profiles'),
    'The public projection contains private fields.';
  assert not has_table_privilege('anon', 'public.public_profiles', 'INSERT')
    and not has_table_privilege('authenticated', 'public.public_profiles', 'UPDATE'),
    'The public projection grants writes.';
  assert (select p.full_name = 'Privacy owner'
    from public.listings l cross join lateral public.public_profiles(l) p
    where l.id = 'a2ac9849-11d3-47b6-b5a3-b31300000004'), 'Public seller relationship failed.';
  begin
    perform email from public.public_profiles;
    raise exception 'The public projection exposes email.';
  exception when undefined_column then null;
  end;
end;
$$;

set local role authenticated;
set local request.jwt.claim.sub = 'a2ac9849-11d3-47b6-b5a3-b31300000002';
do $$
begin
  assert not exists(select from public.profiles
    where id = 'a2ac9849-11d3-47b6-b5a3-b31300000001'), 'Another account reads private contacts.';
  assert (select email = 'privacy-buyer@example.invalid' from public.profiles where id=auth.uid()),
    'Own profile is inaccessible.';
end;
$$;

set local request.jwt.claim.sub = 'a2ac9849-11d3-47b6-b5a3-b31300000001';
do $$
declare affected bigint;
begin
  assert (select phone = '+254700000001' and address = 'Private account address'
    from public.profiles where id=auth.uid()), 'Own contact data is missing.';
  update public.profiles set full_name='Updated public name' where id=auth.uid();
  get diagnostics affected = row_count;
  assert affected=1, 'Normal profile editing failed.';
  assert (select full_name='Updated public name' from public.public_profiles where id=auth.uid()),
    'The public display did not follow the profile edit.';
  assert (select p.full_name='Privacy buyer'
    from public.enquiries e cross join lateral public.public_profiles(e) p
    where e.id='a2ac9849-11d3-47b6-b5a3-b31300000005'), 'Enquiry reviewer display failed.';
end;
$$;

set local request.jwt.claim.sub = 'a2ac9849-11d3-47b6-b5a3-b31300000003';
do $$
begin
  assert (select email='privacy-owner@example.invalid' from public.profiles
    where id='a2ac9849-11d3-47b6-b5a3-b31300000001'), 'Staff account support access failed.';
end;
$$;
reset role;
rollback;
