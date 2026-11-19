-- Match the photo relationship used by marketplace cards and vehicle galleries.
create index listing_images_listing_id_idx
  on public.listing_images (listing_id);

-- Allow newest public inventory to be paged without sorting every listing.
create index listings_active_public_created_at_idx
  on public.listings (created_at desc)
  where status = 'active' and sale_channel in ('standard', 'dealer_public');
