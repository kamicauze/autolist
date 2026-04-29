create table if not exists public.cms_special_offers (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  audience text not null default 'All visitors',
  description text not null default '',
  image_url text not null default '',
  target_url text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  redemption_count integer not null default 0 check (redemption_count >= 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint cms_special_offers_date_range_check
    check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index if not exists idx_cms_special_offers_admin_order
  on public.cms_special_offers(sort_order, updated_at desc);

create index if not exists idx_cms_special_offers_public_active
  on public.cms_special_offers(sort_order)
  where status = 'active' and image_url <> '';

create index if not exists idx_cms_special_offers_schedule
  on public.cms_special_offers(status, starts_at, ends_at);

alter table public.cms_special_offers enable row level security;

drop policy if exists "Active CMS special offers are public." on public.cms_special_offers;
create policy "Active CMS special offers are public."
  on public.cms_special_offers
  for select
  using (
    status = 'active'
    and image_url <> ''
    and (starts_at is null or starts_at <= timezone('utc'::text, now()))
    and (ends_at is null or ends_at >= timezone('utc'::text, now()))
  );

drop policy if exists "Admins view CMS special offers." on public.cms_special_offers;
create policy "Admins view CMS special offers."
  on public.cms_special_offers
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins insert CMS special offers." on public.cms_special_offers;
create policy "Admins insert CMS special offers."
  on public.cms_special_offers
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins update CMS special offers." on public.cms_special_offers;
create policy "Admins update CMS special offers."
  on public.cms_special_offers
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_cms'))
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins delete CMS special offers." on public.cms_special_offers;
create policy "Admins delete CMS special offers."
  on public.cms_special_offers
  for delete
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

create or replace function public.set_cms_special_offers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_cms_special_offers_updated_at on public.cms_special_offers;

create trigger set_cms_special_offers_updated_at
before update on public.cms_special_offers
for each row
execute function public.set_cms_special_offers_updated_at();
