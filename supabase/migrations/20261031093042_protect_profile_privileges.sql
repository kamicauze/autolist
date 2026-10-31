-- RLS controls rows, but does not protect role/account-state columns or TRUNCATE.
-- Keep the existing buyer/seller/dealer onboarding transitions and profile edits.
create or replace function public.guard_profile_access_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      if coalesce(new.role, '') not in ('buyer', 'seller', 'dealer')
        or new.deactivated_at is not null
        or new.deactivated_by is not null
        or new.deactivation_reason is not null then
        raise exception 'Account access fields require a trusted server operation.'
          using errcode = '42501';
      end if;
    else
      if (new.role is distinct from old.role and not (
          coalesce(old.role, '') in ('buyer', 'seller', 'dealer')
          and coalesce(new.role, '') in ('buyer', 'seller', 'dealer')
        ))
        or new.deactivated_at is distinct from old.deactivated_at
        or new.deactivated_by is distinct from old.deactivated_by
        or new.deactivation_reason is distinct from old.deactivation_reason then
        raise exception 'Account access fields require a trusted server operation.'
          using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_profile_access_fields()
  from public, anon, authenticated;

drop trigger if exists guard_profile_access_fields on public.profiles;
create trigger guard_profile_access_fields
  before insert or update on public.profiles
  for each row execute function public.guard_profile_access_fields();

-- These privileges are unnecessary for Data API clients and bypass row policies.
revoke truncate, references, trigger on all tables in schema public
  from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from public, anon, authenticated;
