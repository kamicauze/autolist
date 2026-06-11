-- Per-sales-rep dealership permissions, delegated by the dealer owner.
-- These let a dealer grant a rep scoped access to the dealership's data.
-- Managing/adding other sales reps stays dealer-only and is intentionally
-- NOT part of this catalog.

alter table public.dealer_sales_agents
  add column if not exists permissions text[] not null default '{}';

alter table public.dealer_sales_agents
  drop constraint if exists dealer_sales_agents_permissions_check;

alter table public.dealer_sales_agents
  add constraint dealer_sales_agents_permissions_check
  check (
    permissions <@ array[
      'listings.manage',
      'enquiries.respond',
      'reviews.manage',
      'billing.view'
    ]::text[]
  );

-- Whether the 'listings.manage' permission applies to every dealership listing
-- ('all') or only listings explicitly assigned to this rep ('assigned').
alter table public.dealer_sales_agents
  add column if not exists listings_scope text not null default 'all'
    check (listings_scope in ('all', 'assigned'));

-- A listing can be assigned to a specific sales rep within its dealership.
alter table public.listings
  add column if not exists assigned_agent_id uuid
    references public.dealer_sales_agents(id) on delete set null;

create index if not exists idx_listings_assigned_agent_id
  on public.listings(assigned_agent_id);

-- True when `user_id` is an active, accepted rep who may manage `target_listing_id`,
-- honouring the rep's listings_scope ('all' vs 'assigned').
create or replace function public.sales_agent_can_manage_listing(user_id uuid, target_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    join public.dealers d on d.profile_id = l.seller_id
    join public.dealer_sales_agents dsa on dsa.dealer_id = d.id
    where l.id = target_listing_id
      and dsa.agent_profile_id = user_id
      and dsa.status = 'active'
      and dsa.invite_status = 'accepted'
      and 'listings.manage' = any (dsa.permissions)
      and (dsa.listings_scope = 'all' or l.assigned_agent_id = dsa.id)
  );
$$;

-- Dealer-owner profile ids the given user may act for under `permission`
-- (active + accepted sales rep that holds the permission). Most dealer-owned
-- rows key off the owner's profile id (listings.seller_id, entitlements.user_id),
-- so policies can compare against this set directly.
create or replace function public.sales_agent_principal_ids(user_id uuid, permission text)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.profile_id
  from public.dealer_sales_agents dsa
  join public.dealers d on d.id = dsa.dealer_id
  where dsa.agent_profile_id = user_id
    and dsa.status = 'active'
    and dsa.invite_status = 'accepted'
    and permission = any (dsa.permissions);
$$;

-- Dealer ids the given user may act for under `permission` (for rows that key
-- off dealer_id, e.g. conversation_threads).
create or replace function public.sales_agent_dealer_ids(user_id uuid, permission text)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select dsa.dealer_id
  from public.dealer_sales_agents dsa
  where dsa.agent_profile_id = user_id
    and dsa.status = 'active'
    and dsa.invite_status = 'accepted'
    and permission = any (dsa.permissions);
$$;

-- ---------------------------------------------------------------------------
-- listings.manage
-- ---------------------------------------------------------------------------
drop policy if exists "Sales reps view dealer listings." on public.listings;
create policy "Sales reps view dealer listings."
  on public.listings for select
  using (public.sales_agent_can_manage_listing(auth.uid(), id));

-- Insert is checked inline against the new row (the listing does not yet exist,
-- so the function cannot look it up). An 'assigned' rep must assign the listing
-- to their own rep record.
drop policy if exists "Sales reps insert dealer listings." on public.listings;
create policy "Sales reps insert dealer listings."
  on public.listings for insert
  with check (
    exists (
      select 1
      from public.dealers d
      join public.dealer_sales_agents dsa on dsa.dealer_id = d.id
      where d.profile_id = listings.seller_id
        and dsa.agent_profile_id = auth.uid()
        and dsa.status = 'active'
        and dsa.invite_status = 'accepted'
        and 'listings.manage' = any (dsa.permissions)
        and (dsa.listings_scope = 'all' or listings.assigned_agent_id = dsa.id)
    )
  );

drop policy if exists "Sales reps update dealer listings." on public.listings;
create policy "Sales reps update dealer listings."
  on public.listings for update
  using (public.sales_agent_can_manage_listing(auth.uid(), id))
  with check (
    exists (
      select 1
      from public.dealers d
      join public.dealer_sales_agents dsa on dsa.dealer_id = d.id
      where d.profile_id = listings.seller_id
        and dsa.agent_profile_id = auth.uid()
        and dsa.status = 'active'
        and dsa.invite_status = 'accepted'
        and 'listings.manage' = any (dsa.permissions)
        and (dsa.listings_scope = 'all' or listings.assigned_agent_id = dsa.id)
    )
  );

-- listing images follow the parent listing's manageability (scope-aware)
drop policy if exists "Sales reps view dealer listing images." on public.listing_images;
create policy "Sales reps view dealer listing images."
  on public.listing_images for select
  using (public.sales_agent_can_manage_listing(auth.uid(), listing_images.listing_id));

drop policy if exists "Sales reps insert dealer listing images." on public.listing_images;
create policy "Sales reps insert dealer listing images."
  on public.listing_images for insert
  with check (public.sales_agent_can_manage_listing(auth.uid(), listing_images.listing_id));

drop policy if exists "Sales reps delete dealer listing images." on public.listing_images;
create policy "Sales reps delete dealer listing images."
  on public.listing_images for delete
  using (public.sales_agent_can_manage_listing(auth.uid(), listing_images.listing_id));

-- ---------------------------------------------------------------------------
-- enquiries.respond  (legacy enquiries + conversation threads/messages)
-- ---------------------------------------------------------------------------
drop policy if exists "Sales reps view dealer enquiries." on public.enquiries;
create policy "Sales reps view dealer enquiries."
  on public.enquiries for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = enquiries.listing_id
        and l.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
    )
  );

drop policy if exists "Sales reps update dealer enquiries." on public.enquiries;
create policy "Sales reps update dealer enquiries."
  on public.enquiries for update
  using (
    exists (
      select 1 from public.listings l
      where l.id = enquiries.listing_id
        and l.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = enquiries.listing_id
        and l.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
    )
  );

drop policy if exists "Sales reps view dealer threads." on public.conversation_threads;
create policy "Sales reps view dealer threads."
  on public.conversation_threads for select
  using (
    seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
    or dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
  );

drop policy if exists "Sales reps update dealer threads." on public.conversation_threads;
create policy "Sales reps update dealer threads."
  on public.conversation_threads for update
  using (
    seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
    or dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
  )
  with check (
    seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
    or dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
  );

drop policy if exists "Sales reps view dealer thread participants." on public.conversation_participants;
create policy "Sales reps view dealer thread participants."
  on public.conversation_participants for select
  using (
    exists (
      select 1 from public.conversation_threads ct
      where ct.id = conversation_participants.thread_id
        and (
          ct.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
          or ct.dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
        )
    )
  );

drop policy if exists "Sales reps view dealer thread messages." on public.conversation_messages;
create policy "Sales reps view dealer thread messages."
  on public.conversation_messages for select
  using (
    exists (
      select 1 from public.conversation_threads ct
      where ct.id = conversation_messages.thread_id
        and (
          ct.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
          or ct.dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
        )
    )
  );

drop policy if exists "Sales reps send dealer thread messages." on public.conversation_messages;
create policy "Sales reps send dealer thread messages."
  on public.conversation_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_threads ct
      where ct.id = conversation_messages.thread_id
        and (
          ct.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
          or ct.dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
        )
    )
  );

-- ---------------------------------------------------------------------------
-- billing.view  (read-only membership/entitlements)
-- ---------------------------------------------------------------------------
drop policy if exists "Sales reps view dealer entitlements." on public.seller_package_entitlements;
create policy "Sales reps view dealer entitlements."
  on public.seller_package_entitlements for select
  using (user_id in (select public.sales_agent_principal_ids(auth.uid(), 'billing.view')));

-- ---------------------------------------------------------------------------
-- Dealer record visibility: any active accepted rep can read their dealership
-- (needed for listings/billing context regardless of approval status).
-- reviews.manage is enforced in the UI: listing reviews are already public to
-- read, and dealers do not delete buyer reviews.
-- ---------------------------------------------------------------------------
drop policy if exists "Sales reps view their dealership." on public.dealers;
create policy "Sales reps view their dealership."
  on public.dealers for select
  using (
    id in (
      select dsa.dealer_id
      from public.dealer_sales_agents dsa
      where dsa.agent_profile_id = auth.uid()
        and dsa.status = 'active'
        and dsa.invite_status = 'accepted'
    )
  );

-- A rep must be able to read their own linkage row(s) so the app can resolve
-- their dealership context and granted permissions at runtime.
drop policy if exists "Sales reps view own agent record." on public.dealer_sales_agents;
create policy "Sales reps view own agent record."
  on public.dealer_sales_agents for select
  using (agent_profile_id = auth.uid());
