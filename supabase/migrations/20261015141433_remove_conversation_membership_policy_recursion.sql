-- Break only the recursive membership edge between thread and participant RLS.
-- The helper cannot inspect another user's membership and is not exposed as an
-- API: neither anon nor authenticated gains USAGE on the private schema.
create function private.is_conversation_participant(target_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.conversation_participants cp
    where cp.thread_id = target_thread_id
      and cp.profile_id = (select auth.uid())
  );
$$;

revoke all on function private.is_conversation_participant(uuid) from public, anon;
grant execute on function private.is_conversation_participant(uuid) to authenticated;

-- Anonymous viewers have no conversation membership. Restricting this policy
-- avoids asking anon to execute the private helper; other policies are retained.
alter policy "Participants and staff can view conversation threads"
on public.conversation_threads
to authenticated
using (
  public.is_staff(auth.uid())
  or auth.uid() = buyer_id
  or auth.uid() = seller_id
  or private.is_conversation_participant(id)
);

-- A rep's existing dealership permission still grants participant messages,
-- while internal staff notes remain restricted to staff at the database level.
alter policy "Sales reps view dealer thread messages."
on public.conversation_messages
using (
  visibility = 'participants'
  and exists (
    select 1 from public.conversation_threads ct
    where ct.id = conversation_messages.thread_id
      and (
        ct.seller_id in (select public.sales_agent_principal_ids(auth.uid(), 'enquiries.respond'))
        or ct.dealer_id in (select public.sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'))
      )
  )
);
