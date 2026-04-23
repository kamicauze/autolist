alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('stripe', 'mpesa', 'manual'));

create table if not exists public.seller_package_entitlements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id text not null,
  status text not null default 'active'
    check (status in ('active', 'expired', 'cancelled')),
  listing_limit integer
    check (listing_limit is null or listing_limit > 0),
  starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone not null,
  auto_renew boolean default false not null,
  payment_id uuid references public.payments(id) on delete set null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (ends_at > starts_at)
);

create index if not exists idx_seller_package_entitlements_user_status
  on public.seller_package_entitlements(user_id, status, ends_at desc);

create unique index if not exists idx_seller_package_entitlements_one_active_per_user
  on public.seller_package_entitlements(user_id)
  where status = 'active';

alter table public.seller_package_entitlements enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_package_entitlements'
      and policyname = 'Owners view own seller package entitlements.'
  ) then
    create policy "Owners view own seller package entitlements."
      on public.seller_package_entitlements
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'seller_package_entitlements'
      and policyname = 'Admins view all seller package entitlements.'
  ) then
    create policy "Admins view all seller package entitlements."
      on public.seller_package_entitlements
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
end $$;

create or replace function public.set_seller_package_entitlement_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_seller_package_entitlement_updated_at
  on public.seller_package_entitlements;

create trigger set_seller_package_entitlement_updated_at
before update on public.seller_package_entitlements
for each row
execute function public.set_seller_package_entitlement_updated_at();
