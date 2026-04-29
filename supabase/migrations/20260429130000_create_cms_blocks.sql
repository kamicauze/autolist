create table if not exists public.cms_blocks (
  id uuid default uuid_generate_v4() primary key,
  block_key text not null unique,
  label text not null,
  description text,
  draft_content jsonb not null default '{}'::jsonb,
  published_content jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamp with time zone,
  updated_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_cms_blocks_status_key
  on public.cms_blocks(status, block_key);

alter table public.cms_blocks enable row level security;

drop policy if exists "Published CMS blocks are public." on public.cms_blocks;
create policy "Published CMS blocks are public."
  on public.cms_blocks
  for select
  using (status = 'published' and published_content is not null);

drop policy if exists "Admins view CMS blocks." on public.cms_blocks;
create policy "Admins view CMS blocks."
  on public.cms_blocks
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins insert CMS blocks." on public.cms_blocks;
create policy "Admins insert CMS blocks."
  on public.cms_blocks
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins update CMS blocks." on public.cms_blocks;
create policy "Admins update CMS blocks."
  on public.cms_blocks
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_cms'))
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

create or replace function public.set_cms_blocks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_cms_blocks_updated_at on public.cms_blocks;

create trigger set_cms_blocks_updated_at
before update on public.cms_blocks
for each row
execute function public.set_cms_blocks_updated_at();

insert into public.cms_blocks (
  block_key,
  label,
  description,
  draft_content,
  published_content,
  status,
  published_at
)
values
  (
    'home_hero',
    'Homepage hero',
    'Main landing banner copy, image, and quick-search visibility.',
    '{
      "headline": "Find your perfect vehicle.",
      "subheading": "Search cars, vans, bikes, trucks, plant and farm equipment from one marketplace.",
      "backgroundImageUrl": "/hero-car.jpg",
      "quickSearchEnabled": true
    }'::jsonb,
    '{
      "headline": "Find your perfect vehicle.",
      "subheading": "Search cars, vans, bikes, trucks, plant and farm equipment from one marketplace.",
      "backgroundImageUrl": "/hero-car.jpg",
      "quickSearchEnabled": true
    }'::jsonb,
    'published',
    timezone('utc'::text, now())
  ),
  (
    'home_featured_listings',
    'Featured listings rail',
    'Landing page listing section title, tabs, labels, and item counts.',
    '{
      "title": "Your recent activities",
      "viewAllLabel": "View all",
      "featuredTabLabel": "Featured",
      "recentTabLabel": "Recently added",
      "favoritesTabLabel": "Favorites",
      "showTabs": true,
      "showFavoritesTab": true,
      "featuredLimit": 8,
      "recentLimit": 4
    }'::jsonb,
    '{
      "title": "Your recent activities",
      "viewAllLabel": "View all",
      "featuredTabLabel": "Featured",
      "recentTabLabel": "Recently added",
      "favoritesTabLabel": "Favorites",
      "showTabs": true,
      "showFavoritesTab": true,
      "featuredLimit": 8,
      "recentLimit": 4
    }'::jsonb,
    'published',
    timezone('utc'::text, now())
  ),
  (
    'home_sections',
    'Homepage sections',
    'Controls which major landing page modules are visible.',
    '{
      "showHowItWorks": true,
      "showDiscoverMore": true,
      "showSellVehicle": true,
      "showVideoReviews": true,
      "showServices": true,
      "showNews": true,
      "showBrandLogos": true,
      "showSocialMedia": true
    }'::jsonb,
    '{
      "showHowItWorks": true,
      "showDiscoverMore": true,
      "showSellVehicle": true,
      "showVideoReviews": true,
      "showServices": true,
      "showNews": true,
      "showBrandLogos": true,
      "showSocialMedia": true
    }'::jsonb,
    'published',
    timezone('utc'::text, now())
  )
on conflict (block_key) do nothing;
