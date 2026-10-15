\set ON_ERROR_STOP on
begin;

create role anon; create role authenticated;
create schema auth; create schema private;
grant usage on schema public,auth to anon,authenticated;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create table profiles(id uuid primary key,role text);
create function public.is_staff(user_id uuid) returns boolean language sql stable security definer as $$ select exists(select 1 from profiles where id=user_id and role in ('admin','support','super_admin')); $$;
create function public.sales_agent_principal_ids(user_id uuid,permission text) returns setof uuid language sql stable security definer as $$ select '00000000-0000-0000-0000-000000000002'::uuid where user_id='00000000-0000-0000-0000-000000000005'::uuid and permission='enquiries.respond'; $$;
create function public.sales_agent_dealer_ids(user_id uuid,permission text) returns setof uuid language sql stable security definer as $$ select '00000000-0000-0000-0000-000000000011'::uuid where user_id='00000000-0000-0000-0000-000000000005'::uuid and permission='enquiries.respond'; $$;
create table conversation_threads(id uuid primary key,buyer_id uuid,seller_id uuid,dealer_id uuid,created_by uuid,status text,last_message_at timestamptz,last_message_preview text,last_message_sender_id uuid,updated_at timestamptz);
create table conversation_participants(thread_id uuid references conversation_threads(id),profile_id uuid,participant_role text);
create table conversation_messages(id uuid primary key,thread_id uuid references conversation_threads(id),sender_id uuid,body text,visibility text,created_at timestamptz);
alter table conversation_threads enable row level security;
alter table conversation_participants enable row level security;
alter table conversation_messages enable row level security;
grant select on conversation_threads,conversation_participants,conversation_messages to anon;
grant select,insert,update on conversation_threads,conversation_participants,conversation_messages to authenticated;
create policy "Participants and staff can create conversation messages" on public.conversation_messages for INSERT to public with check (((auth.uid() = sender_id) AND (is_staff(auth.uid()) OR (EXISTS ( SELECT 1
   FROM conversation_threads ct
  WHERE ((ct.id = conversation_messages.thread_id) AND ((ct.buyer_id = auth.uid()) OR (ct.seller_id = auth.uid())))))) AND ((visibility = 'participants'::text) OR is_staff(auth.uid()))));
create policy "Participants and staff can view conversation messages" on public.conversation_messages for SELECT to public using ((is_staff(auth.uid()) OR ((visibility = 'participants'::text) AND (EXISTS ( SELECT 1
   FROM conversation_threads ct
  WHERE ((ct.id = conversation_messages.thread_id) AND ((ct.buyer_id = auth.uid()) OR (ct.seller_id = auth.uid()))))))));
create policy "Sales reps send dealer thread messages." on public.conversation_messages for INSERT to public with check (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM conversation_threads ct
  WHERE ((ct.id = conversation_messages.thread_id) AND ((ct.seller_id IN ( SELECT sales_agent_principal_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_principal_ids)) OR (ct.dealer_id IN ( SELECT sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_dealer_ids))))))));
create policy "Sales reps view dealer thread messages." on public.conversation_messages for SELECT to public using ((EXISTS ( SELECT 1
   FROM conversation_threads ct
  WHERE ((ct.id = conversation_messages.thread_id) AND ((ct.seller_id IN ( SELECT sales_agent_principal_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_principal_ids)) OR (ct.dealer_id IN ( SELECT sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_dealer_ids)))))));
create policy "Participants and staff can view conversation participants" on public.conversation_participants for SELECT to public using ((is_staff(auth.uid()) OR (profile_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM conversation_threads ct
  WHERE ((ct.id = conversation_participants.thread_id) AND ((ct.buyer_id = auth.uid()) OR (ct.seller_id = auth.uid())))))));
create policy "Sales reps view dealer thread participants." on public.conversation_participants for SELECT to public using ((EXISTS ( SELECT 1
   FROM conversation_threads ct
  WHERE ((ct.id = conversation_participants.thread_id) AND ((ct.seller_id IN ( SELECT sales_agent_principal_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_principal_ids)) OR (ct.dealer_id IN ( SELECT sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_dealer_ids)))))));
create policy "Staff can manage conversation participants" on public.conversation_participants for ALL to public using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
create policy "Participants and staff can create conversation threads" on public.conversation_threads for INSERT to public with check ((is_staff(auth.uid()) OR (auth.uid() = buyer_id) OR (auth.uid() = seller_id)));
create policy "Participants and staff can update conversation threads" on public.conversation_threads for UPDATE to public using ((is_staff(auth.uid()) OR (auth.uid() = buyer_id) OR (auth.uid() = seller_id))) with check ((is_staff(auth.uid()) OR (auth.uid() = buyer_id) OR (auth.uid() = seller_id)));
create policy "Participants and staff can view conversation threads" on public.conversation_threads for SELECT to public using ((is_staff(auth.uid()) OR (auth.uid() = buyer_id) OR (auth.uid() = seller_id) OR (EXISTS ( SELECT 1
   FROM conversation_participants cp
  WHERE ((cp.thread_id = conversation_threads.id) AND (cp.profile_id = auth.uid()))))));
create policy "Sales reps update dealer threads." on public.conversation_threads for UPDATE to public using (((seller_id IN ( SELECT sales_agent_principal_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_principal_ids)) OR (dealer_id IN ( SELECT sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_dealer_ids)))) with check (((seller_id IN ( SELECT sales_agent_principal_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_principal_ids)) OR (dealer_id IN ( SELECT sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_dealer_ids))));
create policy "Sales reps view dealer threads." on public.conversation_threads for SELECT to public using (((seller_id IN ( SELECT sales_agent_principal_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_principal_ids)) OR (dealer_id IN ( SELECT sales_agent_dealer_ids(auth.uid(), 'enquiries.respond'::text) AS sales_agent_dealer_ids))));
insert into profiles values ('00000000-0000-0000-0000-000000000004','admin'),('00000000-0000-0000-0000-000000000009','support'),('00000000-0000-0000-0000-000000000010','super_admin');
insert into conversation_threads values ('00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','waiting_on_seller',now(),'Public message','00000000-0000-0000-0000-000000000001',now()),('00000000-0000-0000-0000-000000000101',null,'00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000011',null,'waiting_on_seller',now(),'Guest message',null,now()),('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000007','open',now(),'Other conversation','00000000-0000-0000-0000-000000000007',now());
insert into conversation_participants values ('00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000001','buyer'),('00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000002','seller'),('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000002','seller'),('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000003','buyer');
insert into conversation_messages values ('00000000-0000-0000-0000-000000000200','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000001','Public message','participants','2026-10-15T09:00Z'),('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000004','Private staff note','staff_only','2026-10-15T10:00Z'),('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000101',null,'Guest message','participants','2026-10-15T09:00Z'),('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000007','Other conversation','participants','2026-10-15T09:00Z');
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
create trigger sync_thread after insert on conversation_messages for each row execute function public.sync_thread_after_message();
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
do $$ begin perform count(*) from conversation_threads; raise exception 'Expected recursive baseline'; exception when sqlstate '42P17' then null; end $$;
reset role;
\ir ../migrations/20261015141433_remove_conversation_membership_policy_recursion.sql
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
do $$ begin if (select count(*) from conversation_threads)<>1 or (select count(*) from conversation_messages where visibility='participants')<>1 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 1'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
do $$ begin if (select count(*) from conversation_threads)<>2 or (select count(*) from conversation_messages where visibility='participants')<>2 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 2'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000003';
do $$ begin if (select count(*) from conversation_threads)<>1 or (select count(*) from conversation_messages where visibility='participants')<>0 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 3'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000004';
do $$ begin if (select count(*) from conversation_threads)<>3 or (select count(*) from conversation_messages where visibility='participants')<>3 or (select count(*) from conversation_messages where visibility='staff_only')<>1 then raise exception 'Role matrix mismatch for sample user 4'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000009';
do $$ begin if (select count(*) from conversation_threads)<>3 or (select count(*) from conversation_messages where visibility='participants')<>3 or (select count(*) from conversation_messages where visibility='staff_only')<>1 then raise exception 'Role matrix mismatch for sample user 9'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000010';
do $$ begin if (select count(*) from conversation_threads)<>3 or (select count(*) from conversation_messages where visibility='participants')<>3 or (select count(*) from conversation_messages where visibility='staff_only')<>1 then raise exception 'Role matrix mismatch for sample user 10'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000005';
do $$ begin if (select count(*) from conversation_threads)<>2 or (select count(*) from conversation_messages where visibility='participants')<>2 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 5'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000006';
do $$ begin if (select count(*) from conversation_threads)<>0 or (select count(*) from conversation_messages where visibility='participants')<>0 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 6'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000013';
do $$ begin if (select count(*) from conversation_threads)<>0 or (select count(*) from conversation_messages where visibility='participants')<>0 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 13'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000007';
do $$ begin if (select count(*) from conversation_threads)<>1 or (select count(*) from conversation_messages where visibility='participants')<>1 or (select count(*) from conversation_messages where visibility='staff_only')<>0 then raise exception 'Role matrix mismatch for sample user 7'; end if; perform count(*) from conversation_participants; end $$;
reset role;
set local role anon; set local request.jwt.claim.sub=''; do $$ begin if (select count(*) from conversation_threads)<>0 or (select count(*) from conversation_messages)<>0 or (select count(*) from conversation_participants)<>0 then raise exception 'Anonymous data exposure'; end if; end $$; reset role;
do $$ begin if has_schema_privilege('authenticated','private','USAGE') or has_schema_privilege('anon','private','USAGE') or has_function_privilege('anon','private.is_conversation_participant(uuid)','EXECUTE') or not has_function_privilege('authenticated','private.is_conversation_participant(uuid)','EXECUTE') then raise exception 'Private helper ACL mismatch'; end if; end $$;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000001'; insert into conversation_messages values ('00000000-0000-0000-0000-000000000600','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000001','Participant reply','participants',now()); reset role;
do $$ begin if not exists(select 1 from conversation_threads where id='00000000-0000-0000-0000-000000000100' and status='waiting_on_seller' and last_message_preview='Participant reply' and last_message_sender_id='00000000-0000-0000-0000-000000000001') then raise exception 'Participant insert/trigger mismatch'; end if; end $$;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000002'; insert into conversation_messages values ('00000000-0000-0000-0000-000000000601','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000002','Participant reply','participants',now()); reset role;
do $$ begin if not exists(select 1 from conversation_threads where id='00000000-0000-0000-0000-000000000100' and status='waiting_on_buyer' and last_message_preview='Participant reply' and last_message_sender_id='00000000-0000-0000-0000-000000000002') then raise exception 'Participant insert/trigger mismatch'; end if; end $$;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000005'; insert into conversation_messages values ('00000000-0000-0000-0000-000000000602','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000005','Participant reply','participants',now()); reset role;
do $$ begin if not exists(select 1 from conversation_threads where id='00000000-0000-0000-0000-000000000100' and status='waiting_on_buyer' and last_message_preview='Participant reply' and last_message_sender_id='00000000-0000-0000-0000-000000000005') then raise exception 'Participant insert/trigger mismatch'; end if; end $$;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000002'; insert into conversation_messages values ('00000000-0000-0000-0000-000000000603','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000002','Participant reply','participants',now()); reset role;
do $$ begin if not exists(select 1 from conversation_threads where id='00000000-0000-0000-0000-000000000101' and status='waiting_on_buyer' and last_message_preview='Participant reply' and last_message_sender_id='00000000-0000-0000-0000-000000000002') then raise exception 'Participant insert/trigger mismatch'; end if; end $$;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000006'; do $$ begin insert into conversation_messages values ('00000000-0000-0000-0000-000000000700','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000006','Unauthorized','participants',now()); raise exception 'Unauthorized insert succeeded'; exception when insufficient_privilege then null; end $$; reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000005'; do $$ begin insert into conversation_messages values ('00000000-0000-0000-0000-000000000700','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000005','Unauthorized','participants',now()); raise exception 'Unauthorized insert succeeded'; exception when insufficient_privilege then null; end $$; reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000001'; do $$ begin insert into conversation_messages values ('00000000-0000-0000-0000-000000000700','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000002','Unauthorized','participants',now()); raise exception 'Unauthorized insert succeeded'; exception when insufficient_privilege then null; end $$; reset role;
set local role authenticated; set local request.jwt.claim.sub='00000000-0000-0000-0000-000000000013'; do $$ begin insert into conversation_messages values ('00000000-0000-0000-0000-000000000700','00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000013','Unauthorized','participants',now()); raise exception 'Unauthorized insert succeeded'; exception when insufficient_privilege then null; end $$; reset role;
rollback;
