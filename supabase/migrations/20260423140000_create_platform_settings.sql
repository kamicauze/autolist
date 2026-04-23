create table if not exists public.platform_settings (
  id integer primary key default 1 check (id = 1),
  support_email text not null default 'support@autolist.africa',
  default_listing_review_sla_hours integer not null default 24 check (
    default_listing_review_sla_hours >= 1
    and default_listing_review_sla_hours <= 168
  ),
  ai_smart_search_enabled boolean not null default true,
  manual_dealer_approval_required boolean not null default true,
  updated_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.platform_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_settings'
      and policyname = 'Admins view platform settings.'
  ) then
    create policy "Admins view platform settings."
      on public.platform_settings
      for select
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_settings'
      and policyname = 'Admins insert platform settings.'
  ) then
    create policy "Admins insert platform settings."
      on public.platform_settings
      for insert
      with check (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_settings'
      and policyname = 'Admins update platform settings.'
  ) then
    create policy "Admins update platform settings."
      on public.platform_settings
      for update
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;
end $$;

insert into public.platform_settings (id)
values (1)
on conflict (id) do nothing;

create or replace function public.set_platform_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_platform_settings_updated_at on public.platform_settings;

create trigger set_platform_settings_updated_at
before update on public.platform_settings
for each row
execute function public.set_platform_settings_updated_at();
