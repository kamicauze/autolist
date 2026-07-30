alter table public.listings
  add column category text not null default 'car';

update public.listings
set category = case
  when lower(body_type) in (
    'panel_van',
    'pickup',
    'minibus',
    'passenger_van',
    'van'
  ) then 'van'
  when lower(body_type) in (
    'bike',
    'motorbike',
    'motorcycle',
    'electric_bike',
    'electric bike',
    'sport',
    'street',
    'cruiser',
    'touring',
    'scooter',
    'off_road',
    'dirt',
    'standard'
  ) then 'motorbike'
  when lower(body_type) in (
    'truck',
    'box',
    'flatbed',
    'tipper',
    'tractor_head'
  ) then 'truck'
  when lower(body_type) in (
    'plant',
    'plant machinery',
    'excavator',
    'bulldozer',
    'crane',
    'loader'
  ) then 'plant_construction'
  when lower(body_type) in (
    'farm',
    'farm equipment',
    'tractor',
    'plough',
    'harvester'
  ) then 'farm_agricultural'
  else 'car'
end;

alter table public.listings
  add constraint listings_category_check
  check (
    category in (
      'car',
      'van',
      'motorbike',
      'truck',
      'plant_construction',
      'farm_agricultural'
    )
  );

create index listings_active_category_created_at_idx
  on public.listings (category, created_at desc)
  where status = 'active';
