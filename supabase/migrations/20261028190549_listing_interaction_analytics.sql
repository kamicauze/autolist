-- Additive analytics only. Existing customer and enquiry records are unchanged.
create table public.listing_interactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('call', 'financing')),
  viewer_key text not null check (char_length(viewer_key) between 3 and 80),
  interacted_on date not null default (timezone('Africa/Nairobi', now()))::date,
  created_at timestamptz not null default now(),
  unique (listing_id, interaction_type, viewer_key, interacted_on)
);
alter table public.listing_interactions enable row level security;
revoke all on public.listing_interactions from public, anon, authenticated;
grant select, insert on public.listing_interactions to service_role;
comment on table public.listing_interactions is 'Daily unique call-link activations and financing form opens. Not completed calls, submitted enquiries or approvals. Server-only analytics; no phone, email or IP stored.';

create function public.get_listing_interaction_totals(p_listing_ids uuid[])
returns table (days integer, call_clicks bigint, financing_clicks bigint)
language sql stable security invoker set search_path = '' as $$
  select periods.days,
    count(*) filter (where i.interaction_type = 'call') as call_clicks,
    count(*) filter (where i.interaction_type = 'financing') as financing_clicks
  from (values (1), (7), (30)) as periods(days)
  left join public.listing_interactions i
    on i.listing_id = any(p_listing_ids)
    and i.interacted_on between (timezone('Africa/Nairobi', now()))::date - (periods.days - 1)
      and (timezone('Africa/Nairobi', now()))::date
  group by periods.days order by periods.days;
$$;
revoke all on function public.get_listing_interaction_totals(uuid[]) from public, anon, authenticated;
grant execute on function public.get_listing_interaction_totals(uuid[]) to service_role;
