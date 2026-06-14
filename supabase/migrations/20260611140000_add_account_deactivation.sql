-- Account deactivation: a deactivated profile is blocked from the app and the
-- underlying auth user is banned (handled in app code via the admin API).
alter table public.profiles
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_by uuid references public.profiles(id) on delete set null,
  add column if not exists deactivation_reason text;

create index if not exists idx_profiles_deactivated_at
  on public.profiles(deactivated_at)
  where deactivated_at is not null;
