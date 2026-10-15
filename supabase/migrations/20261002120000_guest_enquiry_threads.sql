-- Guest (signed-out) listing enquiries become real conversation threads so they
-- land in the seller/dealer Messages inbox. A guest thread has no buyer profile;
-- the guest's contact details live on the thread, and guest-authored messages
-- have a null sender_id.

alter table public.conversation_threads
  alter column buyer_id drop not null,
  alter column created_by drop not null,
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text;

alter table public.conversation_threads
  drop constraint if exists conversation_threads_source_check;
alter table public.conversation_threads
  add constraint conversation_threads_source_check
  check (source in ('listing_enquiry', 'public_listing_enquiry', 'direct_message', 'admin_created'));

alter table public.conversation_threads
  drop constraint if exists conversation_threads_buyer_or_guest_check;
alter table public.conversation_threads
  add constraint conversation_threads_buyer_or_guest_check
  check (
    buyer_id is not null
    or (guest_name is not null and (guest_email is not null or guest_phone is not null))
  );

create index if not exists idx_conversation_threads_guest_listing
  on public.conversation_threads (listing_id, seller_id)
  where buyer_id is null;

alter table public.conversation_messages
  alter column sender_id drop not null;

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
      when new.sender_id is null then 'waiting_on_seller'
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
