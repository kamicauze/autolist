alter table public.cms_banners
  add column if not exists category_targets text[] not null default '{}'::text[];

update public.cms_banners
set category_targets = '{}'::text[]
where category_targets is null;

alter table public.cms_banners
  drop constraint if exists cms_banners_category_targets_check;

alter table public.cms_banners
  add constraint cms_banners_category_targets_check
  check (
    category_targets <@ array[
      'cars_vans',
      'motorbike',
      'truck',
      'plant_construction',
      'farm_agricultural'
    ]::text[]
  );

create index if not exists idx_cms_banners_category_targets
  on public.cms_banners using gin(category_targets);
