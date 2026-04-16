alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('buyer', 'seller', 'dealer', 'admin', 'support'));

create or replace function public.is_staff(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role in ('admin', 'support')
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.conversation_threads (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  dealer_id uuid references public.dealers(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null not null,
  status text not null default 'open' check (status in ('open', 'waiting_on_buyer', 'waiting_on_seller', 'escalated', 'resolved', 'closed')),
  source text not null default 'listing_enquiry' check (source in ('listing_enquiry', 'direct_message', 'admin_created')),
  subject text,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_preview text,
  last_message_sender_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (listing_id, buyer_id, seller_id)
);

create table if not exists public.conversation_participants (
  id uuid default uuid_generate_v4() primary key,
  thread_id uuid references public.conversation_threads(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  participant_role text not null check (participant_role in ('buyer', 'seller', 'dealer', 'admin', 'support')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (thread_id, profile_id)
);

create table if not exists public.conversation_messages (
  id uuid default uuid_generate_v4() primary key,
  thread_id uuid references public.conversation_threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null not null,
  body text not null,
  visibility text not null default 'participants' check (visibility in ('participants', 'staff_only')),
  message_type text not null default 'text' check (message_type in ('text', 'system', 'ticket_note')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.support_tickets (
  id uuid default uuid_generate_v4() primary key,
  thread_id uuid references public.conversation_threads(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  subject text not null,
  category text not null default 'buyer_seller_chat',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'triaged', 'waiting_on_seller', 'waiting_on_buyer', 'resolved', 'closed')),
  customer_summary text,
  internal_note text,
  resolution_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ticket_events (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.support_tickets(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null not null,
  event_type text not null check (event_type in ('created', 'assigned', 'status_changed', 'internal_note', 'resolved', 'closed')),
  note text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_conversation_threads_buyer_id on public.conversation_threads(buyer_id);
create index if not exists idx_conversation_threads_seller_id on public.conversation_threads(seller_id);
create index if not exists idx_conversation_threads_last_message_at on public.conversation_threads(last_message_at desc);
create index if not exists idx_conversation_messages_thread_id_created_at on public.conversation_messages(thread_id, created_at);
create index if not exists idx_support_tickets_status_priority on public.support_tickets(status, priority, updated_at desc);
create index if not exists idx_support_tickets_thread_id on public.support_tickets(thread_id);
create index if not exists idx_support_tickets_assigned_to on public.support_tickets(assigned_to);

create or replace function public.sync_thread_after_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversation_threads
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 180),
    last_message_sender_id = new.sender_id,
    status = case
      when public.is_staff(new.sender_id) then 'open'
      when new.sender_id = buyer_id then 'waiting_on_seller'
      when new.sender_id = seller_id then 'waiting_on_buyer'
      else status
    end,
    updated_at = timezone('utc'::text, now())
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists trg_conversation_threads_updated_at on public.conversation_threads;
create trigger trg_conversation_threads_updated_at
before update on public.conversation_threads
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_support_tickets_updated_at on public.support_tickets;
create trigger trg_support_tickets_updated_at
before update on public.support_tickets
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_sync_thread_after_message on public.conversation_messages;
create trigger trg_sync_thread_after_message
after insert on public.conversation_messages
for each row execute procedure public.sync_thread_after_message();

alter table public.conversation_threads enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_events enable row level security;

create policy "Participants and staff can view conversation threads"
on public.conversation_threads
for select
using (
  public.is_staff(auth.uid())
  or auth.uid() = buyer_id
  or auth.uid() = seller_id
  or exists (
    select 1
    from public.conversation_participants cp
    where cp.thread_id = conversation_threads.id
      and cp.profile_id = auth.uid()
  )
);

create policy "Participants and staff can create conversation threads"
on public.conversation_threads
for insert
with check (
  public.is_staff(auth.uid())
  or auth.uid() = buyer_id
  or auth.uid() = seller_id
);

create policy "Participants and staff can update conversation threads"
on public.conversation_threads
for update
using (
  public.is_staff(auth.uid())
  or auth.uid() = buyer_id
  or auth.uid() = seller_id
)
with check (
  public.is_staff(auth.uid())
  or auth.uid() = buyer_id
  or auth.uid() = seller_id
);

create policy "Participants and staff can view conversation participants"
on public.conversation_participants
for select
using (
  public.is_staff(auth.uid())
  or profile_id = auth.uid()
  or exists (
    select 1
    from public.conversation_threads ct
    where ct.id = conversation_participants.thread_id
      and (ct.buyer_id = auth.uid() or ct.seller_id = auth.uid())
  )
);

create policy "Staff can manage conversation participants"
on public.conversation_participants
for all
using (public.is_staff(auth.uid()))
with check (public.is_staff(auth.uid()));

create policy "Participants and staff can view conversation messages"
on public.conversation_messages
for select
using (
  public.is_staff(auth.uid())
  or (
    visibility = 'participants'
    and exists (
      select 1
      from public.conversation_threads ct
      where ct.id = conversation_messages.thread_id
        and (ct.buyer_id = auth.uid() or ct.seller_id = auth.uid())
    )
  )
);

create policy "Participants and staff can create conversation messages"
on public.conversation_messages
for insert
with check (
  auth.uid() = sender_id
  and (
    public.is_staff(auth.uid())
    or exists (
      select 1
      from public.conversation_threads ct
      where ct.id = conversation_messages.thread_id
        and (ct.buyer_id = auth.uid() or ct.seller_id = auth.uid())
    )
  )
  and (
    visibility = 'participants'
    or public.is_staff(auth.uid())
  )
);

create policy "Thread participants and staff can view support tickets"
on public.support_tickets
for select
using (
  public.is_staff(auth.uid())
  or created_by = auth.uid()
  or exists (
    select 1
    from public.conversation_threads ct
    where ct.id = support_tickets.thread_id
      and (ct.buyer_id = auth.uid() or ct.seller_id = auth.uid())
  )
);

create policy "Thread participants and staff can create support tickets"
on public.support_tickets
for insert
with check (
  auth.uid() = created_by
  and (
    public.is_staff(auth.uid())
    or exists (
      select 1
      from public.conversation_threads ct
      where ct.id = support_tickets.thread_id
        and (ct.buyer_id = auth.uid() or ct.seller_id = auth.uid())
    )
  )
);

create policy "Staff can update support tickets"
on public.support_tickets
for update
using (public.is_staff(auth.uid()))
with check (public.is_staff(auth.uid()));

create policy "Ticket viewers can view ticket events"
on public.ticket_events
for select
using (
  public.is_staff(auth.uid())
  or exists (
    select 1
    from public.support_tickets st
    left join public.conversation_threads ct on ct.id = st.thread_id
    where st.id = ticket_events.ticket_id
      and (
        st.created_by = auth.uid()
        or ct.buyer_id = auth.uid()
        or ct.seller_id = auth.uid()
      )
  )
);

create policy "Staff can create ticket events"
on public.ticket_events
for insert
with check (public.is_staff(auth.uid()) and auth.uid() = actor_id);

with enquiry_threads as (
  insert into public.conversation_threads (
    listing_id,
    buyer_id,
    seller_id,
    dealer_id,
    created_by,
    source,
    status,
    subject,
    last_message_at,
    last_message_preview,
    last_message_sender_id,
    created_at,
    updated_at
  )
  select
    e.listing_id,
    e.user_id,
    l.seller_id,
    l.dealer_id,
    e.user_id,
    'listing_enquiry',
    case
      when (array_agg(e.status order by e.created_at desc))[1] = 'closed' then 'closed'
      when (array_agg(e.status order by e.created_at desc))[1] = 'replied' then 'waiting_on_buyer'
      else 'waiting_on_seller'
    end,
    concat_ws(' ', l.year::text, l.make, l.model),
    max(e.created_at),
    left((array_agg(e.message order by e.created_at desc))[1], 180),
    e.user_id,
    min(e.created_at),
    max(e.updated_at)
  from public.enquiries e
  join public.listings l on l.id = e.listing_id
  group by e.listing_id, e.user_id, l.seller_id, l.dealer_id, l.year, l.make, l.model
  on conflict (listing_id, buyer_id, seller_id) do update
  set
    last_message_at = excluded.last_message_at,
    last_message_preview = excluded.last_message_preview,
    last_message_sender_id = excluded.last_message_sender_id,
    updated_at = excluded.updated_at
  returning id, buyer_id, seller_id
)
insert into public.conversation_participants (thread_id, profile_id, participant_role)
select distinct thread_id, profile_id, participant_role
from (
  select id as thread_id, buyer_id as profile_id, 'buyer'::text as participant_role from enquiry_threads
  union all
  select id as thread_id, seller_id as profile_id, 'seller'::text as participant_role from enquiry_threads
) seeded_participants
on conflict (thread_id, profile_id) do nothing;

insert into public.conversation_messages (
  thread_id,
  sender_id,
  body,
  visibility,
  message_type,
  created_at
)
select
  ct.id,
  e.user_id,
  e.message,
  'participants',
  'text',
  e.created_at
from public.enquiries e
join public.listings l on l.id = e.listing_id
join public.conversation_threads ct
  on ct.listing_id = e.listing_id
 and ct.buyer_id = e.user_id
 and ct.seller_id = l.seller_id
where not exists (
  select 1
  from public.conversation_messages cm
  where cm.thread_id = ct.id
    and cm.sender_id = e.user_id
    and cm.body = e.message
    and cm.created_at = e.created_at
);
