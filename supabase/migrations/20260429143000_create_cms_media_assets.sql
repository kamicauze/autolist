create table if not exists public.cms_media_assets (
  id uuid default uuid_generate_v4() primary key,
  storage_key text not null unique,
  url text not null,
  file_name text not null,
  mime_type text not null,
  width integer,
  height integer,
  file_size_bytes integer,
  alt_text text,
  usage_context text not null default 'general' check (
    usage_context in ('homepage_hero', 'blog_cover', 'banner', 'offer', 'general')
  ),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_cms_media_assets_created_at
  on public.cms_media_assets(created_at desc);

create index if not exists idx_cms_media_assets_usage_context
  on public.cms_media_assets(usage_context, created_at desc);

alter table public.cms_media_assets enable row level security;

drop policy if exists "Admins view CMS media assets." on public.cms_media_assets;
create policy "Admins view CMS media assets."
  on public.cms_media_assets
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins insert CMS media assets." on public.cms_media_assets;
create policy "Admins insert CMS media assets."
  on public.cms_media_assets
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins update CMS media assets." on public.cms_media_assets;
create policy "Admins update CMS media assets."
  on public.cms_media_assets
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_cms'))
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

create or replace function public.set_cms_media_assets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_cms_media_assets_updated_at on public.cms_media_assets;

create trigger set_cms_media_assets_updated_at
before update on public.cms_media_assets
for each row
execute function public.set_cms_media_assets_updated_at();
