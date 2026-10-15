\set ON_ERROR_STOP on
begin;

-- Run only in an empty disposable PostgreSQL database. Existing tables cause
-- an immediate failure before any functions can be installed.
create table public.conversation_threads (
  id uuid primary key,
  buyer_id uuid,
  seller_id uuid,
  last_message_at timestamptz,
  last_message_preview text,
  last_message_sender_id uuid,
  status text,
  updated_at timestamptz
);
create table public.conversation_messages (
  id uuid primary key,
  thread_id uuid references public.conversation_threads(id),
  sender_id uuid,
  body text,
  visibility text,
  created_at timestamptz
);
create function public.is_staff(profile_id uuid) returns boolean language sql as $$
  select profile_id = '00000000-0000-0000-0000-000000000003'::uuid;
$$;

\ir ../migrations/20261015135741_keep_staff_notes_out_of_thread_previews.sql
create trigger sync_message after insert on public.conversation_messages
for each row execute function public.sync_thread_after_message();

insert into public.conversation_threads values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '2026-10-14T09:00:00Z', 'Previous public message',
  '00000000-0000-0000-0000-000000000001', 'waiting_on_seller',
  '2026-10-14T09:00:00Z'
);

create temp table original_thread as select * from public.conversation_threads;
insert into public.conversation_messages values (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000003',
  'Confidential staff note', 'staff_only', '2026-10-15T09:00:00Z'
);
do $$ begin
  if (select to_jsonb(t) from public.conversation_threads t)
     is distinct from (select to_jsonb(t) from original_thread t) then
    raise exception 'Internal note changed participant-visible thread metadata';
  end if;
  if (select count(*) from public.conversation_messages where visibility = 'staff_only') <> 1 then
    raise exception 'Internal note was not retained for staff';
  end if;
end $$;

insert into public.conversation_messages values (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  repeat('Seller public reply ', 20), 'participants', '2026-10-15T10:00:00Z'
);
do $$ begin
  if not exists (select 1 from public.conversation_threads where
    status = 'waiting_on_buyer' and
    last_message_sender_id = '00000000-0000-0000-0000-000000000002' and
    last_message_at = '2026-10-15T10:00:00Z' and
    last_message_preview = left(repeat('Seller public reply ', 20), 180)) then
    raise exception 'Seller participant reply no longer updates preview/status';
  end if;
end $$;

insert into public.conversation_messages values (
  '00000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Buyer follow up', 'participants', '2026-10-15T11:00:00Z'
);
do $$ begin
  if not exists (select 1 from public.conversation_threads where
    status = 'waiting_on_seller' and last_message_preview = 'Buyer follow up') then
    raise exception 'Buyer participant reply no longer updates preview/status';
  end if;
end $$;

update public.conversation_threads set buyer_id = null;
insert into public.conversation_messages values (
  '00000000-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000010', null,
  'Guest follow up', 'participants', '2026-10-15T12:00:00Z'
);
do $$ begin
  if not exists (select 1 from public.conversation_threads where
    status = 'waiting_on_seller' and last_message_preview = 'Guest follow up' and
    last_message_sender_id is null and last_message_at = '2026-10-15T12:00:00Z') then
    raise exception 'Guest participant message no longer updates preview/status';
  end if;
end $$;
rollback;
