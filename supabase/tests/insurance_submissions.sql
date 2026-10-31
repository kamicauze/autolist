-- Run with psql -X -v ON_ERROR_STOP=1 on the offline recovery_check database.
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
  ('c081ffbe-f8ce-4528-9caa-e915728a3001', 'insurance-access-owner@example.invalid', '{"intended_role":"buyer"}'),
  ('c081ffbe-f8ce-4528-9caa-e915728a3002', 'insurance-access-other@example.invalid', '{"intended_role":"buyer"}');

set local role anon;
set local request.jwt.claim.sub = '';
do $$
declare
  base jsonb := jsonb_build_object(
    'full_name', 'Insurance access guest', 'email', 'insurance-access-guest@example.invalid',
    'phone_country_code', '+254', 'phone_number', '700000000',
    'vehicle_make_model', 'Test vehicle', 'vehicle_year', 2020,
    'cover_type', 'third_party', 'preferred_start_date', current_date + 1,
    'status', 'new', 'quote_currency', 'KES', 'created_at', now(), 'updated_at', now()
  );
  forged jsonb;
  submission jsonb;
begin
  submission := base || jsonb_build_object('id', gen_random_uuid(), 'reference', 'insurance-access-guest');
  insert into public.insurance_requests
    select * from jsonb_populate_record(null::public.insurance_requests, submission);

  if exists (select 1 from public.insurance_requests) then
    raise exception 'A guest could read private requests.';
  end if;

  for forged in select value from jsonb_array_elements('[
    {"status":"quoted"}, {"status":"bound"}, {"insurer_name":"Forged insurer"},
    {"quote_amount":100}, {"quote_currency":"USD"}, {"admin_notes":"Forged note"},
    {"quoted_at":"2026-01-01T00:00:00Z"}, {"bound_at":"2026-01-01T00:00:00Z"},
    {"requester_profile_id":"c081ffbe-f8ce-4528-9caa-e915728a3002"}
  ]'::jsonb) loop
    submission := base || forged || jsonb_build_object(
      'id', gen_random_uuid(), 'reference', 'insurance-access-forged-' || gen_random_uuid()
    );
    begin
      insert into public.insurance_requests
        select * from jsonb_populate_record(null::public.insurance_requests, submission);
      raise exception 'A forged guest request was accepted: %', forged;
    exception when insufficient_privilege then null;
    end;
  end loop;
end;
$$;

set local role authenticated;
set local request.jwt.claim.sub = 'c081ffbe-f8ce-4528-9caa-e915728a3001';
insert into public.insurance_requests (
  reference, requester_profile_id, full_name, email, phone_country_code,
  phone_number, vehicle_make_model, vehicle_year, cover_type, preferred_start_date
) values (
  'insurance-access-owner', auth.uid(), 'Insurance access owner',
  'insurance-access-owner@example.invalid', '+254', '700000000',
  'Test vehicle', 2020, 'third_party', current_date + 1
);

do $$
declare affected bigint;
begin
  if (select count(*) from public.insurance_requests where reference like 'insurance-access-%') <> 1 then
    raise exception 'An owner could not read exactly their own submission.';
  end if;

  begin
    insert into public.insurance_requests (
      reference, requester_profile_id, full_name, email, phone_country_code,
      phone_number, vehicle_make_model, vehicle_year, cover_type, preferred_start_date
    ) values (
      'insurance-access-impersonated', 'c081ffbe-f8ce-4528-9caa-e915728a3002',
      'Insurance access owner', 'insurance-access-owner@example.invalid',
      '+254', '700000000', 'Test vehicle', 2020, 'third_party', current_date + 1
    );
    raise exception 'An authenticated user impersonated another requester.';
  exception when insufficient_privilege then null;
  end;

  update public.insurance_requests set status = 'quoted' where reference = 'insurance-access-owner';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'An owner could quote their own request.'; end if;
end;
$$;

set local role service_role;
update public.profiles set role = 'super_admin' where id = 'c081ffbe-f8ce-4528-9caa-e915728a3001';
set local role authenticated;
do $$
declare affected bigint;
begin
  update public.insurance_requests set status = 'quoted', insurer_name = 'Test insurer',
    quote_amount = 100, admin_notes = 'Authorised access test', quoted_at = now()
    where reference = 'insurance-access-owner';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Authorised quote management failed.'; end if;
end;
$$;

rollback;
select 'Insurance submission checks passed; fixtures rolled back.' as result;
