create or replace function public.sync_thread_after_message()
returns trigger
language plpgsql
as $$
begin
  -- Internal notes remain visible only through the staff-only message policy.
  -- They must not appear in participant-visible thread previews or metadata.
  if new.visibility = 'staff_only' then
    return new;
  end if;

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
