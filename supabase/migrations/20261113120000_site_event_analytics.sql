-- Additive analytics only. Existing customer, listing and enquiry records are unchanged.
create table public.site_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]{1,39}$'),
  path text not null check (char_length(path) between 1 and 200 and left(path, 1) = '/'),
  target text check (char_length(target) <= 120),
  visitor_id uuid not null,
  visit_id uuid not null,
  signed_in boolean not null default false,
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  referrer_origin text check (char_length(referrer_origin) <= 200)
);
create index idx_site_events_occurred_at on public.site_events (occurred_at);
alter table public.site_events enable row level security;
revoke all on public.site_events from public, anon, authenticated;
grant select, insert on public.site_events to service_role;
comment on table public.site_events is 'Public-page views and named clicks. Written by /api/track with the service role; read only through get_site_traffic_summary. No IP, user agent, query string, profile ID or form content is stored.';
comment on column public.site_events.visitor_id is 'Random ID from the httpOnly al_interaction_vid cookie, also for signed-in visitors.';
comment on column public.site_events.visit_id is 'Random per-tab visit ID that rotates after 30 minutes without activity.';

create function public.get_site_traffic_summary(p_days integer default 30, p_limit integer default 10)
returns jsonb
language sql stable security invoker set search_path = '' as $$
  with bounds as (
    select (timezone('Africa/Nairobi', now()))::date as today,
      least(greatest(p_days, 1), 90) as days,
      least(greatest(p_limit, 1), 50) as top
  ),
  events as (
    select e.*, (timezone('Africa/Nairobi', e.occurred_at))::date as day
    from public.site_events e, bounds b
    where e.occurred_at >= ((b.today - (b.days - 1))::timestamp at time zone 'Africa/Nairobi')
  )
  select jsonb_build_object(
    'totals', (
      select coalesce(jsonb_agg(t order by t.days), '[]'::jsonb) from (
        select periods.days,
          count(e.id) filter (where e.event_name = 'page_view') as page_views,
          count(distinct e.visitor_id) as visitors,
          count(distinct e.visit_id) as visits,
          count(e.id) filter (where e.event_name <> 'page_view') as clicks
        from bounds b
        cross join (values (1), (7), (30)) as periods(days)
        left join events e on periods.days <= b.days and e.day > b.today - periods.days
        group by periods.days
      ) t
    ),
    'daily', (
      select coalesce(jsonb_agg(d order by d.day), '[]'::jsonb) from (
        select series.day::date as day,
          count(e.id) filter (where e.event_name = 'page_view') as page_views,
          count(distinct e.visitor_id) as visitors,
          count(distinct e.visit_id) as visits,
          count(e.id) filter (where e.event_name <> 'page_view') as clicks
        from bounds b
        cross join generate_series(b.today - (b.days - 1), b.today, interval '1 day') as series(day)
        left join events e on e.day = series.day::date
        group by series.day
      ) d
    ),
    'top_pages', (
      select coalesce(jsonb_agg(p order by p.total desc, p.label), '[]'::jsonb) from (
        select e.path as label, count(*) as total, count(distinct e.visitor_id) as visitors
        from events e where e.event_name = 'page_view'
        group by e.path order by total desc, e.path limit (select top from bounds)
      ) p
    ),
    'top_clicks', (
      select coalesce(jsonb_agg(c order by c.total desc, c.label), '[]'::jsonb) from (
        select e.event_name as label, count(*) as total, count(distinct e.visitor_id) as visitors
        from events e where e.event_name <> 'page_view'
        group by e.event_name order by total desc, e.event_name limit (select top from bounds)
      ) c
    )
  );
$$;
revoke all on function public.get_site_traffic_summary(integer, integer) from public, anon, authenticated;
grant execute on function public.get_site_traffic_summary(integer, integer) to service_role;
