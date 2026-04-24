create table if not exists public.dealer_sales_agents (
  id uuid default uuid_generate_v4() primary key,
  dealer_id uuid references public.dealers(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null check (length(btrim(name)) > 0),
  email text not null,
  phone text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_verified boolean not null default false,
  whatsapp_enabled boolean not null default true,
  hide_phone_number boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (dealer_id, email)
);

create index if not exists idx_dealer_sales_agents_dealer_id
  on public.dealer_sales_agents(dealer_id);

create index if not exists idx_dealer_sales_agents_profile_id
  on public.dealer_sales_agents(profile_id);

create index if not exists idx_dealer_sales_agents_status
  on public.dealer_sales_agents(status);

alter table public.dealer_sales_agents enable row level security;

create policy "Dealer owners view own sales agents."
  on public.dealer_sales_agents
  for select
  using (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dealers
      where dealers.id = dealer_sales_agents.dealer_id
        and dealers.profile_id = auth.uid()
        and dealers.status in ('PENDING', 'APPROVED')
    )
  );

create policy "Dealer owners insert own sales agents."
  on public.dealer_sales_agents
  for insert
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dealers
      where dealers.id = dealer_sales_agents.dealer_id
        and dealers.profile_id = auth.uid()
        and dealers.status in ('PENDING', 'APPROVED')
    )
  );

create policy "Dealer owners update own sales agents."
  on public.dealer_sales_agents
  for update
  using (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dealers
      where dealers.id = dealer_sales_agents.dealer_id
        and dealers.profile_id = auth.uid()
        and dealers.status in ('PENDING', 'APPROVED')
    )
  )
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dealers
      where dealers.id = dealer_sales_agents.dealer_id
        and dealers.profile_id = auth.uid()
        and dealers.status in ('PENDING', 'APPROVED')
    )
  );

create policy "Admins manage dealer sales agents."
  on public.dealer_sales_agents
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop trigger if exists trg_dealer_sales_agents_updated_at on public.dealer_sales_agents;
create trigger trg_dealer_sales_agents_updated_at
before update on public.dealer_sales_agents
for each row execute procedure public.touch_updated_at();
