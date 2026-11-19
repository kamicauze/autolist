-- Match QA listing visibility using administrator-controlled Auth membership.
create function private.can_view_qa_dealer(owner_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select not exists (
    select from auth.users owner_account
    where owner_account.id = owner_id
      and owner_account.raw_app_meta_data @> '{"qa_account":true}'::jsonb
  ) or exists (
    select from auth.users viewer_account
    where viewer_account.id = (select auth.uid())
      and viewer_account.raw_app_meta_data @> '{"qa_account":true}'::jsonb
  );
$$;
revoke all on function private.can_view_qa_dealer(uuid) from public, anon, authenticated;
grant execute on function private.can_view_qa_dealer(uuid) to anon, authenticated;

create policy "QA dealerships require a QA account"
on public.dealers as restrictive for select to anon, authenticated
using (private.can_view_qa_dealer(profile_id));

-- This existing projection is SECURITY DEFINER, so table RLS alone is insufficient.
create or replace function private.public_dealer_cards()
returns table (
  id uuid, status text, name text, logo_url text, city text, county text,
  mobile text, whatsapp text, email text, address text, about_text text, social_links jsonb
)
language sql stable security definer set search_path = ''
as $$
  select d.id, d.status, d.name, d.logo_url, d.city, d.county,
    d.mobile, d.whatsapp, d.email, d.address, d.about_text, d.social_links
  from public.dealers d
  join public.profiles p on p.id=d.profile_id and p.deactivated_at is null
  where private.can_view_qa_dealer(d.profile_id)
    and (d.status='APPROVED' or exists (
      select from public.listings l where l.dealer_id=d.id and l.seller_id=d.profile_id
        and l.status='active' and l.sale_channel in ('standard', 'dealer_public')
    ));
$$;
