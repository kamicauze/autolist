-- Run with psql -X -v ON_ERROR_STOP=1 on the offline recovery_check database.
-- Fixtures and attempted changes are always rolled back.
begin;

do $$
begin
  if current_database() <> 'recovery_check'
    or current_setting('cron.launch_active_jobs', true) is distinct from 'off' then
    raise exception 'Run this test only in the isolated recovery database.';
  end if;
end;
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('b52e1acf-6b32-46d1-9297-fccf44f73001', 'profile-access-owner@example.invalid', '{"intended_role":"buyer"}'),
  ('b52e1acf-6b32-46d1-9297-fccf44f73002', 'profile-access-other@example.invalid', '{"intended_role":"buyer"}'),
  ('b52e1acf-6b32-46d1-9297-fccf44f73003', 'profile-access-insert@example.invalid', '{"intended_role":"super_admin"}');

do $$
declare
  requested_role text;
  account_id uuid;
begin
  if (select role from public.profiles where id = 'b52e1acf-6b32-46d1-9297-fccf44f73003') <> 'buyer' then
    raise exception 'Signup metadata must not create a staff role.';
  end if;
  foreach requested_role in array array['sales_agent', 'support', 'admin', 'super_admin'] loop
    account_id := gen_random_uuid();
    insert into auth.users (id, email, raw_user_meta_data)
    values (account_id, account_id::text || '@example.invalid',
      jsonb_build_object('intended_role', requested_role));
    if (select role from public.profiles where id=account_id) <> 'buyer' then
      raise exception 'Signup metadata created privileged role %.', requested_role;
    end if;
  end loop;
  foreach requested_role in array array['buyer', 'seller', 'dealer'] loop
    account_id := gen_random_uuid();
    insert into auth.users (id, email, raw_user_meta_data)
    values (account_id, account_id::text || '@example.invalid',
      jsonb_build_object('intended_role', requested_role));
    if (select role from public.profiles where id=account_id) <> requested_role then
      raise exception 'Self-service signup role % was not preserved.', requested_role;
    end if;
  end loop;
end;
$$;

delete from public.profiles where id = 'b52e1acf-6b32-46d1-9297-fccf44f73003';

set local role authenticated;
set local request.jwt.claim.sub = 'b52e1acf-6b32-46d1-9297-fccf44f73001';

do $$
declare
  attempted_role text;
  affected bigint;
begin
  foreach attempted_role in array array['support', 'admin', 'super_admin', 'sales_agent'] loop
    begin
      update public.profiles set role = attempted_role where id = auth.uid();
      raise exception 'An ordinary account assigned itself role %.', attempted_role;
    exception when insufficient_privilege then null;
    end;
  end loop;

  begin
    update public.profiles set deactivated_at = now() where id = auth.uid();
    raise exception 'Account state was editable.';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set deactivated_by = auth.uid() where id = auth.uid();
    raise exception 'Account state actor was editable.';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set deactivation_reason = 'Changed by owner' where id = auth.uid();
    raise exception 'Account state reason was editable.';
  exception when insufficient_privilege then null;
  end;

  update public.profiles set full_name = 'Profile access owner', phone = '+254700000000'
    where id = auth.uid();
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Normal profile editing failed.'; end if;

  update public.profiles set role = 'seller' where id = auth.uid();
  update public.profiles set role = 'dealer' where id = auth.uid();
  if (select role from public.profiles where id = auth.uid()) <> 'dealer' then
    raise exception 'Existing seller/dealer onboarding failed.';
  end if;

  update public.profiles set full_name = 'Cross-account edit'
    where id = 'b52e1acf-6b32-46d1-9297-fccf44f73002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another profile was editable.'; end if;

  if public.has_permission(auth.uid(), 'admin.manage_roles') then
    raise exception 'An ordinary account obtained staff permission.';
  end if;
end;
$$;

set local request.jwt.claim.sub = 'b52e1acf-6b32-46d1-9297-fccf44f73003';
do $$
begin
  begin
    insert into public.profiles (id, role) values (auth.uid(), 'super_admin');
    raise exception 'An ordinary account inserted a staff profile.';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.profiles (id, role, deactivated_by) values (auth.uid(), 'buyer', auth.uid());
    raise exception 'An ordinary account inserted account-state fields.';
  exception when insufficient_privilege then null;
  end;
  insert into public.profiles (id, role) values (auth.uid(), 'buyer');
end;
$$;

set local role service_role;
update public.profiles set role = 'admin', deactivated_at = now(),
  deactivated_by = 'b52e1acf-6b32-46d1-9297-fccf44f73002', deactivation_reason = 'Access test'
  where id = 'b52e1acf-6b32-46d1-9297-fccf44f73001';
do $$
begin
  if not exists (select 1 from public.profiles
    where id = 'b52e1acf-6b32-46d1-9297-fccf44f73001'
      and role = 'admin' and deactivated_at is not null) then
    raise exception 'Trusted role/account management failed.';
  end if;
  if not public.is_staff('b52e1acf-6b32-46d1-9297-fccf44f73001')
    or not public.has_permission('b52e1acf-6b32-46d1-9297-fccf44f73001', 'admin.access')
    or public.is_super_admin('b52e1acf-6b32-46d1-9297-fccf44f73001') then
    raise exception 'Staff permission helpers returned incorrect results.';
  end if;
end;
$$;

set local role authenticated;
set local request.jwt.claim.sub = 'b52e1acf-6b32-46d1-9297-fccf44f73001';
do $$
begin
  begin
    update public.profiles set deactivated_at = null, deactivated_by = null,
      deactivation_reason = null where id = auth.uid();
    raise exception 'An account cleared its own deactivation.';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set role = 'buyer' where id = auth.uid();
    raise exception 'Staff role changes bypassed trusted management.';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local role anon;
set local request.jwt.claim.sub = '';
-- Exercise existing public reads and the non-recursive dealer/sales-agent RLS.
select count(*) from public.listings l left join public.dealers d on d.id = l.dealer_id;
select count(*) from public.profiles;

reset role;
set local role postgres;
create table public.profile_access_default_check (value integer);
reset role;
do $$
begin
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    cross join (values ('anon'), ('authenticated')) as roles(name)
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm')
      and (has_table_privilege(roles.name, c.oid, 'TRUNCATE')
        or has_table_privilege(roles.name, c.oid, 'REFERENCES')
        or has_table_privilege(roles.name, c.oid, 'TRIGGER'))
  ) then
    raise exception 'Public clients retain unnecessary destructive privileges.';
  end if;
  if has_function_privilege('anon', 'public.guard_profile_access_fields()', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.guard_profile_access_fields()', 'EXECUTE') then
    raise exception 'The trigger helper is directly callable.';
  end if;
end;
$$;

rollback;
select 'Profile access checks passed; fixtures rolled back.' as result;
