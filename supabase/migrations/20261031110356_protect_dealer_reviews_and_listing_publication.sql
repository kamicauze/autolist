-- Preserve server-reviewed dealer status while owners edit business details.
create function public.guard_dealer_review_fields()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  field_name text;
  new_fields jsonb := to_jsonb(new);
  old_fields jsonb := to_jsonb(old);
begin
  if current_user not in ('anon', 'authenticated') then return new; end if;
  if not exists (select from public.profiles where id=auth.uid() and deactivated_at is null) then
    raise insufficient_privilege using message='An active account is required.';
  end if;
  if public.has_permission(auth.uid(), 'admin.manage_dealers') then return new; end if;
  -- The app supports both legacy and current dealer workflow columns.
  foreach field_name in array array[
    'status', 'verified_by', 'verified_at', 'rejection_reason',
    'reviewed_by', 'reviewed_at', 'review_notes'
  ] loop
    if new_fields->field_name is distinct from old_fields->field_name then
      raise insufficient_privilege using message='Dealer review fields can only be changed by staff.';
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function public.guard_dealer_review_fields() from public, anon, authenticated;
create trigger guard_dealer_review_fields before update on public.dealers
for each row execute function public.guard_dealer_review_fields();

-- Listing managers need this yes/no check even without billing.view. Keep the
-- entitlement rows private and bind the lookup to the caller's own principal.
create function private.seller_has_featured_access(target_seller_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (
    target_seller_id = (select auth.uid())
    or target_seller_id in (
      select public.sales_agent_principal_ids((select auth.uid()), 'listings.manage')
    )
  ) and exists (
    select from public.seller_package_entitlements e
    where e.user_id=target_seller_id and e.status='active'
      and e.plan_id in ('basic', 'professional', 'enterprise')
      and e.starts_at <= now() and e.ends_at > now()
  );
$$;
revoke all on function private.seller_has_featured_access(uuid) from public, anon, authenticated;
grant execute on function private.seller_has_featured_access(uuid) to authenticated;

create function public.guard_listing_publication()
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
        and d.profile_id=new.seller_id and d.status='APPROVED'
    ) then
      raise insufficient_privilege using message='Public listings require staff review or an approved dealership.';
    end if;
  end if;
  if new.status='rejected' and (tg_op='INSERT' or old.status is distinct from new.status) then
    raise insufficient_privilege using message='Only staff can reject a listing.';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_listing_publication() from public, anon, authenticated;
create trigger guard_listing_publication before insert or update on public.listings
for each row execute function public.guard_listing_publication();

-- Image reordering already checks the authenticated owner and the complete
-- image set; anonymous RPC execution is unnecessary.
alter function public.reorder_listing_images(uuid, text[]) set search_path = '';
revoke execute on function public.reorder_listing_images(uuid, text[]) from public, anon;
grant execute on function public.reorder_listing_images(uuid, text[]) to authenticated, service_role;

notify pgrst, 'reload schema';
