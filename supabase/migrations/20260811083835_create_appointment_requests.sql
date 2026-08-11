create table public.appointment_requests (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  dealer_id uuid references public.dealers(id) on delete set null,
  assigned_agent_id uuid references public.dealer_sales_agents(id) on delete set null,
  contact_name text not null
    check (length(btrim(contact_name)) between 1 and 120),
  contact_email text
    check (contact_email is null or length(btrim(contact_email)) between 1 and 320),
  contact_phone text
    check (contact_phone is null or length(btrim(contact_phone)) between 1 and 64),
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  timezone text not null default 'Africa/Nairobi'
    check (timezone = 'Africa/Nairobi'),
  status text not null default 'pending'
    check (
      status in (
        'pending',
        'confirmed',
        'declined',
        'reschedule_requested',
        'completed',
        'cancelled',
        'no_show'
      )
    ),
  message text check (message is null or length(message) <= 250),
  seller_notes text check (seller_notes is null or length(seller_notes) <= 2000),
  seller_responded_at timestamp with time zone,
  status_changed_at timestamp with time zone
    default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
    default timezone('utc'::text, now()) not null,
  constraint appointment_requests_contact_method_check check (
    coalesce(length(btrim(contact_email)), 0) > 0
    or coalesce(length(btrim(contact_phone)), 0) > 0
  ),
  constraint appointment_requests_time_range_check
    check (end_at = start_at + interval '1 hour')
);

comment on table public.appointment_requests is
  'Buyer viewing requests owned by the listing seller or dealer. Times are stored as timestamptz and interpreted using the Africa/Nairobi timezone label.';

comment on column public.appointment_requests.buyer_id is
  'Authenticated buyer profile when present; null for guest requests.';

comment on column public.appointment_requests.seller_id is
  'Snapshot of listings.seller_id, synchronized by trigger on insert.';

comment on column public.appointment_requests.dealer_id is
  'Snapshot of listings.dealer_id, null for privately owned listings.';

create index idx_appointment_requests_listing_created
  on public.appointment_requests(listing_id, created_at desc);

create index idx_appointment_requests_seller_queue
  on public.appointment_requests(seller_id, status, start_at);

create index idx_appointment_requests_dealer_queue
  on public.appointment_requests(dealer_id, status, start_at)
  where dealer_id is not null;

create index idx_appointment_requests_buyer_created
  on public.appointment_requests(buyer_id, created_at desc)
  where buyer_id is not null;

create index idx_appointment_requests_assigned_agent
  on public.appointment_requests(assigned_agent_id, status, start_at)
  where assigned_agent_id is not null;

create index idx_appointment_requests_calendar
  on public.appointment_requests(start_at, end_at);

create or replace function public.sync_appointment_request_ownership()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  listing_seller_id uuid;
  listing_dealer_id uuid;
begin
  select listings.seller_id, listings.dealer_id
  into listing_seller_id, listing_dealer_id
  from public.listings
  where listings.id = new.listing_id;

  if listing_seller_id is null then
    raise exception 'Listing not found for appointment request.';
  end if;

  new.seller_id := listing_seller_id;
  new.dealer_id := listing_dealer_id;

  return new;
end;
$$;

create trigger trg_appointment_requests_sync_ownership
before insert or update of listing_id, seller_id, dealer_id
on public.appointment_requests
for each row execute function public.sync_appointment_request_ownership();

create or replace function public.touch_appointment_request_response()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := timezone('utc'::text, now());

    if new.status <> 'pending' then
      new.seller_responded_at := timezone('utc'::text, now());
    end if;
  elsif new.seller_notes is distinct from old.seller_notes then
    new.seller_responded_at := timezone('utc'::text, now());
  end if;

  return new;
end;
$$;

create trigger trg_appointment_requests_response
before update on public.appointment_requests
for each row execute function public.touch_appointment_request_response();

create trigger trg_appointment_requests_updated_at
before update on public.appointment_requests
for each row execute function public.touch_updated_at();

alter table public.appointment_requests enable row level security;

create policy "Buyers view their own appointment requests."
  on public.appointment_requests
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and buyer_id = (select auth.uid())
  );

create policy "Listing owners view appointment requests."
  on public.appointment_requests
  for select
  to authenticated
  using (seller_id = (select auth.uid()));

create policy "Permitted sales agents view appointment requests."
  on public.appointment_requests
  for select
  to authenticated
  using (
    seller_id in (
      select public.sales_agent_principal_ids(
        (select auth.uid()),
        'enquiries.respond'
      )
    )
  );

create policy "Staff view appointment requests."
  on public.appointment_requests
  for select
  to authenticated
  using (public.is_staff((select auth.uid())));

create policy "Listing owners update appointment requests."
  on public.appointment_requests
  for update
  to authenticated
  using (seller_id = (select auth.uid()))
  with check (
    seller_id = (select auth.uid())
    and (
      assigned_agent_id is null
      or exists (
        select 1
        from public.dealer_sales_agents
        where dealer_sales_agents.id = appointment_requests.assigned_agent_id
          and dealer_sales_agents.dealer_id = appointment_requests.dealer_id
          and dealer_sales_agents.status = 'active'
          and dealer_sales_agents.invite_status = 'accepted'
      )
    )
  );

create policy "Permitted sales agents update appointment requests."
  on public.appointment_requests
  for update
  to authenticated
  using (
    seller_id in (
      select public.sales_agent_principal_ids(
        (select auth.uid()),
        'enquiries.respond'
      )
    )
  )
  with check (
    seller_id in (
      select public.sales_agent_principal_ids(
        (select auth.uid()),
        'enquiries.respond'
      )
    )
    and (
      assigned_agent_id is null
      or exists (
        select 1
        from public.dealer_sales_agents
        where dealer_sales_agents.id = appointment_requests.assigned_agent_id
          and dealer_sales_agents.dealer_id = appointment_requests.dealer_id
          and dealer_sales_agents.status = 'active'
          and dealer_sales_agents.invite_status = 'accepted'
      )
    )
  );

revoke all on table public.appointment_requests from anon, authenticated;
grant select on table public.appointment_requests to authenticated;
grant update (
  status,
  start_at,
  end_at,
  assigned_agent_id,
  seller_notes
) on table public.appointment_requests to authenticated;
grant all on table public.appointment_requests to service_role;

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
      'listing_updated',
      'appointment_requested',
      'appointment_status_changed'
    )
  );
