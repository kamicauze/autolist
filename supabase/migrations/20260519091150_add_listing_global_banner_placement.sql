alter table public.cms_banners
  drop constraint if exists cms_banners_placement_check;

alter table public.cms_banners
  add constraint cms_banners_placement_check
  check (
    placement in (
      'home_hero',
      'home_top',
      'home_featured',
      'listing_global_top',
      'search_top',
      'search_sidebar',
      'vehicle_detail',
      'dashboard',
      'ad_detail_hero',
      'ad_detail_sidebar'
    )
  );
