drop policy if exists "Admins view all listings." on public.listings;
create policy "Admins view all listings."
  on public.listings
  for select
  using (
    public.has_permission(auth.uid(), 'admin.manage_listings')
    or public.has_permission(auth.uid(), 'admin.review_listings')
  );

drop policy if exists "Admins update all listings." on public.listings;
create policy "Admins update all listings."
  on public.listings
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_listings'))
  with check (public.has_permission(auth.uid(), 'admin.manage_listings'));

drop policy if exists "Admins view all listing images." on public.listing_images;
create policy "Admins view all listing images."
  on public.listing_images
  for select
  using (
    public.has_permission(auth.uid(), 'admin.manage_listings')
    or public.has_permission(auth.uid(), 'admin.review_listings')
  );
