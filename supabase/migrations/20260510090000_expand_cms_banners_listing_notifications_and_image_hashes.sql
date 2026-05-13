alter table public.cms_banners
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists body text,
  add column if not exists cta_label text;

update public.cms_banners
set slug = lower(
  regexp_replace(trim(coalesce(title, 'banner')), '[^a-z0-9]+', '-', 'g')
) || '-' || left(replace(id::text, '-', ''), 8)
where slug is null or btrim(slug) = '';

alter table public.cms_banners
  drop constraint if exists cms_banners_placement_check;

alter table public.cms_banners
  add constraint cms_banners_placement_check
  check (
    placement in (
      'home_hero',
      'home_top',
      'home_featured',
      'search_top',
      'search_sidebar',
      'vehicle_detail',
      'dashboard',
      'ad_detail_hero',
      'ad_detail_sidebar'
    )
  );

create unique index if not exists idx_cms_banners_slug
  on public.cms_banners(slug)
  where slug is not null and btrim(slug) <> '';

alter table public.notification_events
  drop constraint if exists notification_events_event_type_check;

alter table public.notification_events
  add constraint notification_events_event_type_check
  check (
    event_type in (
      'new_enquiry',
      'new_message',
      'ticket_created',
      'ticket_assigned',
      'listing_status_changed',
      'listing_updated'
    )
  );

alter table public.listing_images
  add column if not exists perceptual_hash text;

create index if not exists idx_listing_images_perceptual_hash
  on public.listing_images(perceptual_hash)
  where perceptual_hash is not null;
