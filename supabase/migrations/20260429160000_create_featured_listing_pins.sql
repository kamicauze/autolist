create table if not exists public.featured_listing_pins (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused')),
  sort_order integer not null default 0,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint featured_listing_pins_listing_id_key unique (listing_id),
  constraint featured_listing_pins_window_check check (
    ends_at is null
    or starts_at is null
    or ends_at > starts_at
  )
);

create index if not exists idx_featured_listing_pins_status_window
  on public.featured_listing_pins(status, starts_at, ends_at);

create index if not exists idx_featured_listing_pins_sort_order
  on public.featured_listing_pins(sort_order, created_at);

alter table public.featured_listing_pins enable row level security;

drop policy if exists "Active featured listing pins are public." on public.featured_listing_pins;
create policy "Active featured listing pins are public."
  on public.featured_listing_pins
  for select
  using (
    status = 'active'
    and (starts_at is null or starts_at <= timezone('utc'::text, now()))
    and (ends_at is null or ends_at > timezone('utc'::text, now()))
    and exists (
      select 1
      from public.listings
      where listings.id = featured_listing_pins.listing_id
        and listings.status = 'active'
    )
  );

drop policy if exists "Admins view featured listing pins." on public.featured_listing_pins;
create policy "Admins view featured listing pins."
  on public.featured_listing_pins
  for select
  using (
    public.has_permission(auth.uid(), 'admin.manage_cms')
    or public.has_permission(auth.uid(), 'admin.manage_listings')
  );

drop policy if exists "Admins insert featured listing pins." on public.featured_listing_pins;
create policy "Admins insert featured listing pins."
  on public.featured_listing_pins
  for insert
  with check (
    public.has_permission(auth.uid(), 'admin.manage_cms')
    or public.has_permission(auth.uid(), 'admin.manage_listings')
  );

drop policy if exists "Admins update featured listing pins." on public.featured_listing_pins;
create policy "Admins update featured listing pins."
  on public.featured_listing_pins
  for update
  using (
    public.has_permission(auth.uid(), 'admin.manage_cms')
    or public.has_permission(auth.uid(), 'admin.manage_listings')
  )
  with check (
    public.has_permission(auth.uid(), 'admin.manage_cms')
    or public.has_permission(auth.uid(), 'admin.manage_listings')
  );

drop policy if exists "Admins delete featured listing pins." on public.featured_listing_pins;
create policy "Admins delete featured listing pins."
  on public.featured_listing_pins
  for delete
  using (
    public.has_permission(auth.uid(), 'admin.manage_cms')
    or public.has_permission(auth.uid(), 'admin.manage_listings')
  );

create or replace function public.set_featured_listing_pins_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_featured_listing_pins_updated_at on public.featured_listing_pins;

create trigger set_featured_listing_pins_updated_at
before update on public.featured_listing_pins
for each row
execute function public.set_featured_listing_pins_updated_at();
