create table if not exists public.notification_events (
  id uuid default uuid_generate_v4() primary key,
  event_type text not null check (event_type in ('new_enquiry', 'new_message', 'ticket_created', 'ticket_assigned')),
  actor_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  thread_id uuid references public.conversation_threads(id) on delete cascade,
  message_id uuid references public.conversation_messages(id) on delete cascade,
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.notification_deliveries (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.notification_events(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'whatsapp')),
  status text not null default 'sent' check (status in ('queued', 'sent', 'read', 'failed', 'skipped')),
  title text not null,
  body text not null,
  href text,
  metadata jsonb not null default '{}'::jsonb,
  delivered_at timestamp with time zone default timezone('utc'::text, now()),
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notification_events_actor_created_at
  on public.notification_events(actor_id, created_at desc);
create index if not exists idx_notification_events_thread_id
  on public.notification_events(thread_id);
create index if not exists idx_notification_events_ticket_id
  on public.notification_events(ticket_id);
create index if not exists idx_notification_deliveries_recipient_created_at
  on public.notification_deliveries(recipient_id, created_at desc);
create index if not exists idx_notification_deliveries_recipient_status
  on public.notification_deliveries(recipient_id, status);
create unique index if not exists idx_notification_deliveries_event_recipient_channel
  on public.notification_deliveries(event_id, recipient_id, channel);

alter table public.notification_events enable row level security;
alter table public.notification_deliveries enable row level security;

create policy "Recipients and staff can view notification events"
on public.notification_events
for select
using (
  public.is_staff(auth.uid())
  or exists (
    select 1
    from public.notification_deliveries nd
    where nd.event_id = notification_events.id
      and nd.recipient_id = auth.uid()
  )
);

create policy "Recipients can view their notification deliveries"
on public.notification_deliveries
for select
using (recipient_id = auth.uid());

create policy "Recipients can update their notification deliveries"
on public.notification_deliveries
for update
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());
