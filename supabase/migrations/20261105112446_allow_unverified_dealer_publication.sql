-- Publication and business verification are separate: keep review fields staff-only.
-- Preserve owner/rep RLS, active accounts, required media and featured entitlement checks.
create or replace function public.guard_listing_publication()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  entering_submission boolean;
  adding_featured boolean;
  dealer_link_changed boolean;
begin
  if current_user not in ('anon', 'authenticated') then return new; end if;
  if not exists (select from public.profiles where id=auth.uid() and deactivated_at is null) then
    raise insufficient_privilege using message='An active account is required.';
  end if;
  if public.has_permission(auth.uid(), 'admin.manage_listings') then return new; end if;

  dealer_link_changed := tg_op='INSERT';
  adding_featured := coalesce(new.is_featured, false);
  entering_submission := new.status in ('pending', 'active') and new.sale_channel <> 'dealer_only';
  if tg_op='UPDATE' then
    dealer_link_changed := new.dealer_id is distinct from old.dealer_id
      or new.seller_id is distinct from old.seller_id;
    adding_featured := adding_featured and not coalesce(old.is_featured, false);
    entering_submission := entering_submission and (
      new.status is distinct from old.status or old.sale_channel='dealer_only'
    );
  end if;

  if dealer_link_changed and new.dealer_id is not null and not exists (
    select from public.dealers d where d.id=new.dealer_id and d.profile_id=new.seller_id
  ) then
    raise insufficient_privilege using message='A listing must belong to its linked dealership owner.';
  end if;
  if adding_featured and not private.seller_has_featured_access(new.seller_id) then
    raise insufficient_privilege using message='Featured placement requires staff approval or an active package.';
  end if;
  if entering_submission then
    if new.price <= 0 or new.condition is null
      or new.condition not in ('new', 'locally_used', 'foreign_used', 'used') then
      raise check_violation using message='Select a condition and a positive price before submission.';
    end if;
    if (select count(*) from public.listing_images where listing_id=new.id) < 3 then
      raise check_violation using message='Minimum 3 listing images are required before submission.';
    end if;
    if new.status='active' and not exists (
      select from public.dealers d where d.id=new.dealer_id
        and d.profile_id=new.seller_id
    ) then
      raise insufficient_privilege using message='Public listings require staff review or a linked dealership owned by the seller.';
    end if;
  end if;
  if new.status='rejected' and (tg_op='INSERT' or old.status is distinct from new.status) then
    raise insufficient_privilege using message='Only staff can reject a listing.';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_listing_publication() from public, anon, authenticated;

-- Public listing contact cards must work before verification without exposing KYC,
-- contact-person records, internal review notes or legal registration fields.
create function private.public_dealer_cards()
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
  where d.status='APPROVED' or exists (
    select from public.listings l where l.dealer_id=d.id and l.seller_id=d.profile_id
      and l.status='active' and l.sale_channel in ('standard', 'dealer_public')
  );
$$;
revoke all on function private.public_dealer_cards() from public;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.public_dealer_cards() to anon, authenticated, service_role;

create view public.public_dealers with (security_invoker = true) as
  select * from private.public_dealer_cards();
revoke all on public.public_dealers from public, anon, authenticated, service_role;
grant select on public.public_dealers to anon, authenticated, service_role;

-- Explicit relationship follows the existing public_profiles projection pattern.
create function public.public_dealers(public.listings)
returns setof public.public_dealers rows 1
language sql stable security invoker set search_path = ''
as $$
  select d.* from public.public_dealers d where d.id=$1.dealer_id;
$$;
revoke all on function public.public_dealers(public.listings) from public;
grant execute on function public.public_dealers(public.listings) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
