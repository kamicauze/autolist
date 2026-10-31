-- Public seller/reviewer identity is intentionally limited to these three fields.
-- Keep the privileged lookup outside the exposed API schema. The invoker view
-- and computed relationships never return account contact or access fields.
create function private.public_profile_cards()
returns table (id uuid, full_name text, avatar_url text)
language sql stable security definer
set search_path = ''
as $$
  select p.id, p.full_name, p.avatar_url from public.profiles p;
$$;

revoke all on function private.public_profile_cards() from public;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.public_profile_cards() to anon, authenticated, service_role;

create view public.public_profiles with (security_invoker = true) as
  select id, full_name, avatar_url from private.public_profile_cards();
revoke all on public.public_profiles from public, anon, authenticated, service_role;
grant select on public.public_profiles to anon, authenticated, service_role;

-- PostgREST cannot infer foreign keys through a function-backed view.
create function public.public_profiles(public.listings)
returns setof public.public_profiles rows 1
language sql stable security invoker
set search_path = ''
as $$
  select p.* from public.public_profiles p where p.id = $1.seller_id;
$$;

create function public.public_profiles(public.enquiries)
returns setof public.public_profiles rows 1
language sql stable security invoker
set search_path = ''
as $$
  select p.* from public.public_profiles p where p.id = $1.user_id;
$$;

revoke all on function public.public_profiles(public.listings) from public;
revoke all on function public.public_profiles(public.enquiries) from public;
grant execute on function public.public_profiles(public.listings) to anon, authenticated, service_role;
grant execute on function public.public_profiles(public.enquiries) to anon, authenticated, service_role;

-- Both the dedicated reviews table and the existing enquiry-review fallback
-- are supported by the app; some deployed schemas only have the fallback.
do $migration$
begin
  if to_regclass('public.listing_reviews') is not null then
    execute $function$
      create function public.public_profiles(public.listing_reviews)
      returns setof public.public_profiles rows 1
      language sql stable security invoker
      set search_path = ''
      as 'select p.* from public.public_profiles p where p.id = $1.reviewer_id;'
    $function$;
    execute 'revoke all on function public.public_profiles(public.listing_reviews) from public';
    execute 'grant execute on function public.public_profiles(public.listing_reviews) to anon, authenticated, service_role';
  end if;
end;
$migration$;

notify pgrst, 'reload schema';
