-- Offline regression: no network, no scheduled jobs, all fixtures roll back.
begin;
do $$ begin
  assert current_database()='recovery_check'
    and current_setting('cron.launch_active_jobs',true)='off', 'Use the isolated recovery database.';
end; $$;

insert into auth.users(id,email,raw_user_meta_data) values
 ('68735e98-2198-450a-b004-651000000001','publication-pending@example.invalid','{"intended_role":"dealer"}'),
 ('68735e98-2198-450a-b004-651000000002','publication-approved@example.invalid','{"intended_role":"dealer"}'),
 ('68735e98-2198-450a-b004-651000000003','publication-private@example.invalid','{"intended_role":"seller"}'),
 ('68735e98-2198-450a-b004-651000000004','publication-rep@example.invalid','{}'),
 ('68735e98-2198-450a-b004-651000000005','publication-reviewer@example.invalid','{}');
update public.profiles set role='sales_agent' where id='68735e98-2198-450a-b004-651000000004';
update public.profiles set role='admin' where id='68735e98-2198-450a-b004-651000000005';
insert into public.dealers(id,profile_id,name,status,mobile,email,whatsapp,contact_person) values
 ('68735e98-2198-450a-b004-651000000011','68735e98-2198-450a-b004-651000000001','Publication pending dealer','PENDING','','publication-pending@example.invalid','','{}'),
 ('68735e98-2198-450a-b004-651000000012','68735e98-2198-450a-b004-651000000002','Publication approved dealer','APPROVED','','publication-approved@example.invalid','','{}');
insert into public.dealer_sales_agents(id,dealer_id,profile_id,agent_profile_id,name,email,phone,status,invite_status,permissions,listings_scope) values
 ('68735e98-2198-450a-b004-651000000013','68735e98-2198-450a-b004-651000000012','68735e98-2198-450a-b004-651000000002','68735e98-2198-450a-b004-651000000004','Publication manager','publication-rep@example.invalid','','active','accepted',array['listings.manage'],'assigned');
insert into public.seller_package_entitlements(user_id,plan_id,listing_limit,starts_at,ends_at) values
 ('68735e98-2198-450a-b004-651000000002','basic',15,now()-interval '1 day',now()+interval '1 day');
insert into public.listings(id,seller_id,dealer_id,assigned_agent_id,status,make,model,year,price,condition) values
 ('68735e98-2198-450a-b004-651000000021','68735e98-2198-450a-b004-651000000003',null,null,'draft','Toyota','Vitz',2020,1000000,'locally_used'),
 ('68735e98-2198-450a-b004-651000000022','68735e98-2198-450a-b004-651000000002','68735e98-2198-450a-b004-651000000012','68735e98-2198-450a-b004-651000000013','draft','Toyota','Vitz',2020,1000000,'locally_used'),
 ('68735e98-2198-450a-b004-651000000023','68735e98-2198-450a-b004-651000000002','68735e98-2198-450a-b004-651000000012',null,'draft','Toyota','Vitz',2020,1000000,'locally_used'),
 ('68735e98-2198-450a-b004-651000000024','68735e98-2198-450a-b004-651000000001','68735e98-2198-450a-b004-651000000011',null,'draft','Toyota','Vitz',2020,1000000,'locally_used'),
 ('68735e98-2198-450a-b004-651000000026','68735e98-2198-450a-b004-651000000003',null,null,'active','Toyota','Vitz',2020,1000000,null);
insert into public.listing_images(listing_id,r2_key,image_order)
select l.id,'publication-access/'||l.id||'/'||i||'.webp',i
from public.listings l cross join generate_series(0,2)i
where l.id in ('68735e98-2198-450a-b004-651000000021','68735e98-2198-450a-b004-651000000022','68735e98-2198-450a-b004-651000000024');

set local role authenticated;
set local request.jwt.claim.sub='68735e98-2198-450a-b004-651000000001';
do $$ begin
  begin
    update public.dealers set status='APPROVED' where profile_id=auth.uid();
    raise exception 'Owner self-approved a dealer.';
  exception when insufficient_privilege then null; end;
  begin
    update public.dealers set verified_at=now(),verified_by=auth.uid() where profile_id=auth.uid();
    raise exception 'Owner forged a verification stamp.';
  exception when insufficient_privilege then null; end;
  update public.dealers set city='Nairobi' where profile_id=auth.uid();
  assert found, 'Normal business profile editing failed.';
  begin
    update public.listings set status='active' where id='68735e98-2198-450a-b004-651000000024';
    raise exception 'Pending dealership published directly.';
  exception when insufficient_privilege then null; end;
end; $$;

set local request.jwt.claim.sub='68735e98-2198-450a-b004-651000000003';
do $$ begin
  begin
    insert into public.listings(seller_id,status,make,model,year,price,condition)
      values(auth.uid(),'active','Toyota','Vitz',2020,1000000,'locally_used');
    raise exception 'Raw client created a public listing without submission.';
  exception when check_violation then null; end;
  update public.listings set status='pending' where id='68735e98-2198-450a-b004-651000000021';
  assert found, 'Private seller submission failed.';
  begin
    update public.listings set status='active' where id='68735e98-2198-450a-b004-651000000021';
    raise exception 'Private seller bypassed moderation.';
  exception when insufficient_privilege then null; end;
  begin
    update public.listings set dealer_id='68735e98-2198-450a-b004-651000000012'
      where id='68735e98-2198-450a-b004-651000000021';
    raise exception 'Seller impersonated another dealership.';
  exception when insufficient_privilege then null; end;
  begin
    update public.listings set is_featured=true where id='68735e98-2198-450a-b004-651000000021';
    raise exception 'Seller assigned free featured placement.';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.seller_package_entitlements(user_id,plan_id,ends_at)
      values(auth.uid(),'enterprise',now()+interval '1 day');
    raise exception 'Seller granted its own paid entitlement.';
  exception when insufficient_privilege then null; end;
  update public.listings set description='Normal edit of an existing public listing'
    where id='68735e98-2198-450a-b004-651000000026';
  assert found, 'Existing published inventory editing regressed.';
  perform public.reorder_listing_images('68735e98-2198-450a-b004-651000000021',array[
    'publication-access/68735e98-2198-450a-b004-651000000021/2.webp',
    'publication-access/68735e98-2198-450a-b004-651000000021/1.webp',
    'publication-access/68735e98-2198-450a-b004-651000000021/0.webp']);
end; $$;

-- Dealer-only requests remain available; conversion to public stock requires review.
insert into public.listings(id,seller_id,status,sale_channel,make,model,year,price,condition)
values('68735e98-2198-450a-b004-651000000025',auth.uid(),'active','dealer_only','Toyota','Vitz',2020,1000000,'locally_used');
insert into public.listing_images(listing_id,r2_key,image_order)
select '68735e98-2198-450a-b004-651000000025','publication-access/request/'||i||'.webp',i from generate_series(0,2)i;
do $$ begin
  begin
    update public.listings set sale_channel='standard' where id='68735e98-2198-450a-b004-651000000025';
    raise exception 'Dealer-only request bypassed public review.';
  exception when insufficient_privilege then null; end;
end; $$;

set local request.jwt.claim.sub='68735e98-2198-450a-b004-651000000002';
do $$ begin
  begin
    update public.listings set status='active' where id='68735e98-2198-450a-b004-651000000023';
    raise exception 'Dealer submitted without three images.';
  exception when check_violation then null; end;
  update public.listings set status='active',is_featured=true where id='68735e98-2198-450a-b004-651000000022';
  assert found, 'Approved dealer publication with an existing package failed.';
  update public.listings set status='draft',is_featured=false where id='68735e98-2198-450a-b004-651000000022';
end; $$;

set local request.jwt.claim.sub='68735e98-2198-450a-b004-651000000004';
do $$ begin
  assert not exists(select from public.seller_package_entitlements
    where user_id='68735e98-2198-450a-b004-651000000002'), 'Fixture must lack billing.view.';
  update public.listings set status='active',is_featured=true where id='68735e98-2198-450a-b004-651000000022';
  assert found, 'Assigned rep cannot publish without billing.view.';
end; $$;

set local request.jwt.claim.sub='68735e98-2198-450a-b004-651000000005';
update public.dealers set status='APPROVED',verified_by=auth.uid(),verified_at=now()
  where id='68735e98-2198-450a-b004-651000000011';
update public.listings set status='active',is_featured=true
  where id='68735e98-2198-450a-b004-651000000021';
do $$ begin
  assert (select status='APPROVED' from public.dealers where id='68735e98-2198-450a-b004-651000000011'), 'Staff dealer review failed.';
  assert (select status='active' and is_featured from public.listings where id='68735e98-2198-450a-b004-651000000021'), 'Staff listing review/curation failed.';
end; $$;

reset role;
update public.profiles set deactivated_at=now() where id='68735e98-2198-450a-b004-651000000003';
set local role authenticated;
set local request.jwt.claim.sub='68735e98-2198-450a-b004-651000000003';
do $$ begin
  begin
    update public.listings set description='Deactivated account edit' where id='68735e98-2198-450a-b004-651000000021';
    raise exception 'Deactivated account edited a listing.';
  exception when insufficient_privilege then null; end;
  assert not has_function_privilege('anon','public.reorder_listing_images(uuid,text[])','EXECUTE'), 'Anonymous reorder RPC access remains.';
end; $$;
reset role;
rollback;
