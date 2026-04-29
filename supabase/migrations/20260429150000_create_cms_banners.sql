create table if not exists public.cms_banners (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  placement text not null check (
    placement in (
      'home_top',
      'home_featured',
      'search_top',
      'search_sidebar',
      'vehicle_detail',
      'dashboard'
    )
  ),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  desktop_image_url text not null default '',
  mobile_image_url text,
  alt_text text,
  target_url text,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  sort_order integer not null default 0 check (sort_order >= 0),
  impression_count integer not null default 0 check (impression_count >= 0),
  click_count integer not null default 0 check (click_count >= 0),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_cms_banners_admin_order
  on public.cms_banners(placement, sort_order, updated_at desc);

create index if not exists idx_cms_banners_public_active
  on public.cms_banners(placement, sort_order)
  where status = 'active' and desktop_image_url <> '';

create index if not exists idx_cms_banners_schedule
  on public.cms_banners(status, starts_at, ends_at);

alter table public.cms_banners enable row level security;

drop policy if exists "Active CMS banners are public." on public.cms_banners;
create policy "Active CMS banners are public."
  on public.cms_banners
  for select
  using (
    status = 'active'
    and desktop_image_url <> ''
    and (starts_at is null or starts_at <= timezone('utc'::text, now()))
    and (ends_at is null or ends_at >= timezone('utc'::text, now()))
  );

drop policy if exists "Admins view CMS banners." on public.cms_banners;
create policy "Admins view CMS banners."
  on public.cms_banners
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins insert CMS banners." on public.cms_banners;
create policy "Admins insert CMS banners."
  on public.cms_banners
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins update CMS banners." on public.cms_banners;
create policy "Admins update CMS banners."
  on public.cms_banners
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_cms'))
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins delete CMS banners." on public.cms_banners;
create policy "Admins delete CMS banners."
  on public.cms_banners
  for delete
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

create or replace function public.set_cms_banners_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_cms_banners_updated_at on public.cms_banners;

create trigger set_cms_banners_updated_at
before update on public.cms_banners
for each row
execute function public.set_cms_banners_updated_at();
