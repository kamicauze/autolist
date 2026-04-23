create table if not exists public.insurance_requests (
  id uuid default uuid_generate_v4() primary key,
  reference text not null unique,
  requester_profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone_country_code text not null,
  phone_number text not null,
  vehicle_make_model text not null,
  vehicle_year integer not null
    check (vehicle_year between 1980 and 2100),
  cover_type text not null
    check (cover_type in ('comprehensive', 'third_party_fire_theft', 'third_party')),
  preferred_start_date date not null,
  status text not null default 'new'
    check (status in ('new', 'quoted', 'blocked', 'bound', 'cancelled')),
  insurer_name text,
  quote_amount numeric(12, 2)
    check (quote_amount is null or quote_amount >= 0),
  quote_currency text not null default 'KES',
  admin_notes text,
  quoted_at timestamp with time zone,
  bound_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_insurance_requests_status_created_at
  on public.insurance_requests(status, created_at desc);

create index if not exists idx_insurance_requests_requester_profile_id
  on public.insurance_requests(requester_profile_id);

alter table public.insurance_requests enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'insurance_requests'
      and policyname = 'Anyone can submit insurance requests.'
  ) then
    create policy "Anyone can submit insurance requests."
      on public.insurance_requests
      for insert
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'insurance_requests'
      and policyname = 'Owners view own insurance requests.'
  ) then
    create policy "Owners view own insurance requests."
      on public.insurance_requests
      for select
      using (requester_profile_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'insurance_requests'
      and policyname = 'Admins view all insurance requests.'
  ) then
    create policy "Admins view all insurance requests."
      on public.insurance_requests
      for select
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'insurance_requests'
      and policyname = 'Admins update insurance requests.'
  ) then
    create policy "Admins update insurance requests."
      on public.insurance_requests
      for update
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;
end $$;

create or replace function public.set_insurance_request_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_insurance_request_updated_at
  on public.insurance_requests;

create trigger set_insurance_request_updated_at
before update on public.insurance_requests
for each row
execute function public.set_insurance_request_updated_at();

