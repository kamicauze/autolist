-- Fix public dealer/listing reads after sales-rep permissions.
--
-- The previous "Sales reps view their dealership." policy on public.dealers
-- selected public.dealer_sales_agents directly. Existing dealer_sales_agents
-- policies select public.dealers for owner checks, so evaluating a dealers
-- SELECT could recurse dealers -> dealer_sales_agents -> dealers and fail with
-- SQLSTATE 42P17. Use a SECURITY DEFINER helper for the sales-rep dealer-id
-- lookup so the policy does not invoke dealer_sales_agents RLS.

create or replace function public.sales_agent_own_dealer_ids(user_id uuid)
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
    and dsa.invite_status = 'accepted';
$$;

grant execute on function public.sales_agent_own_dealer_ids(uuid) to authenticated;

drop policy if exists "Sales reps view their dealership." on public.dealers;
create policy "Sales reps view their dealership."
  on public.dealers for select
  using (id in (select public.sales_agent_own_dealer_ids(auth.uid())));
