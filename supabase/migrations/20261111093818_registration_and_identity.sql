alter table public.dealers
  drop constraint dealers_status_check,
  add constraint dealers_status_check
    check (status in ('INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED'));

alter table public.dealer_verification_documents
  drop constraint dealer_verification_documents_document_type_check,
  add constraint dealer_verification_documents_document_type_check
    check (document_type in (
      'business_registration', 'tax_certificate', 'id_passport', 'address_proof',
      'other', 'company_logo', 'contact_photo', 'incorporation_certificate',
      'contact_id', 'cr12', 'national_id', 'passport'
    ));

alter table public.seller_verification_documents
  drop constraint seller_verification_documents_document_type_check,
  add constraint seller_verification_documents_document_type_check
    check (document_type in ('national_id_front', 'national_id_back', 'passport'));

-- The older trigger forced even service-role inserts to PENDING. The review
-- guard installed by 20261031110356 protects owner updates on current databases.
drop trigger if exists enforce_dealer_admin_fields on public.dealers;
-- New dealer records are written together with their profile and evidence.
drop policy if exists "Owners insert own dealer profile." on public.dealers;

create function public.save_dealer_registration(
  applicant_id uuid, dealership jsonb, profile_details jsonb, evidence jsonb,
  submit_for_review boolean, review_notes text
)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  account public.profiles%rowtype;
  dealer public.dealers%rowtype;
  details public.dealers := jsonb_populate_record(null::public.dealers, dealership);
  contact public.profiles := jsonb_populate_record(null::public.profiles, profile_details);
begin
  select * into account from public.profiles where id = applicant_id for update;
  if not found or account.deactivated_at is not null
     or coalesce(account.role, '') not in ('buyer', 'seller', 'dealer') then
    raise insufficient_privilege using message = 'An active marketplace account is required.';
  end if;

  select * into dealer from public.dealers where profile_id = applicant_id for update;
  if found then
    if dealer.status is distinct from 'INCOMPLETE' then
      raise check_violation using message = 'This dealership already has a verification request.';
    end if;
    if not submit_for_review then
      return jsonb_build_object('id', dealer.id, 'name', dealer.name);
    end if;
  end if;

  insert into public.dealers (
    profile_id, name, status, address, city, county, location, mobile, email, whatsapp,
    business_name, website, logo_url, about_text, social_links, contact_person,
    doc_incorporation_key, doc_id_key
  ) values (
    applicant_id, details.name, case when submit_for_review then 'PENDING' else 'INCOMPLETE' end,
    details.address, details.city, details.county, details.location, details.mobile,
    coalesce(details.email, ''), coalesce(details.whatsapp, ''), details.business_name,
    details.website, details.logo_url, details.about_text, details.social_links,
    coalesce(details.contact_person, '{}'::jsonb), details.doc_incorporation_key, details.doc_id_key
  )
  on conflict (profile_id) do update
  set name = excluded.name, status = excluded.status, address = excluded.address,
      city = excluded.city, county = coalesce(excluded.county, dealers.county),
      location = excluded.location, mobile = excluded.mobile, email = excluded.email,
      whatsapp = excluded.whatsapp, business_name = excluded.business_name,
      website = excluded.website, logo_url = excluded.logo_url, about_text = excluded.about_text,
      social_links = excluded.social_links, contact_person = excluded.contact_person,
      doc_incorporation_key = excluded.doc_incorporation_key, doc_id_key = excluded.doc_id_key,
      updated_at = now()
  where dealers.status = 'INCOMPLETE' and submit_for_review
  returning * into dealer;
  if not found then
    raise check_violation using message = 'This dealership already has a verification request.';
  end if;

  insert into public.dealer_verification_documents (
    dealer_id, uploaded_by, document_type, display_name, r2_key, mime_type, size_bytes
  )
  select dealer.id, applicant_id, document_type, display_name, r2_key, mime_type, size_bytes
  from jsonb_populate_recordset(null::public.dealer_verification_documents, evidence);

  if submit_for_review then
    insert into public.dealer_verification_workflows (dealer_id, submitted_at, verification_notes)
    values (dealer.id, now(), review_notes)
    on conflict (dealer_id) do update
    set submitted_at = excluded.submitted_at, verification_notes = excluded.verification_notes,
        reviewed_at = null, reviewed_by = null, review_notes = null;
  end if;

  update public.profiles
  set role = 'dealer', phone = contact.phone, city = contact.city, address = contact.address,
      whatsapp = case when submit_for_review then contact.whatsapp else whatsapp end,
      bio = case when submit_for_review then contact.bio else bio end,
      website = case when submit_for_review then contact.website else website end,
      facebook_url = case when submit_for_review then contact.facebook_url else facebook_url end,
      twitter_url = case when submit_for_review then contact.twitter_url else twitter_url end,
      instagram_url = case when submit_for_review then contact.instagram_url else instagram_url end
  where id = applicant_id;

  return jsonb_build_object('id', dealer.id, 'name', dealer.name);
end;
$$;

revoke all on function public.save_dealer_registration(uuid, jsonb, jsonb, jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.save_dealer_registration(uuid, jsonb, jsonb, jsonb, boolean, text)
  to service_role;

create function public.save_private_seller_registration(
  applicant_id uuid, listing_phone text, evidence jsonb
)
returns text[]
language plpgsql security invoker set search_path = ''
as $$
declare
  account public.profiles%rowtype;
  verification public.seller_verifications%rowtype;
  old_paths text[];
  document_types text[];
  saved_document_types text[];
begin
  select * into account from public.profiles where id = applicant_id for update;
  if not found or account.deactivated_at is not null or coalesce(account.role, '') not in ('buyer', 'seller')
     or exists (select from public.dealers where profile_id = applicant_id) then
    raise insufficient_privilege using message = 'An active private seller account is required.';
  end if;

  select array_agg(document_type order by document_type) into document_types
  from jsonb_populate_recordset(null::public.seller_verification_documents, evidence);
  if document_types is distinct from array['passport']
     and document_types is distinct from array['national_id_back', 'national_id_front'] then
    raise check_violation using message = 'Upload both sides of your national ID or your passport photo page.';
  end if;

  insert into public.seller_verifications (profile_id) values (applicant_id)
  on conflict (profile_id) do nothing;

  select * into verification from public.seller_verifications where profile_id = applicant_id for update;
  if verification.status in ('pending', 'approved') then
    raise check_violation using message = 'Your verification is already submitted.';
  end if;

  select array_agg(document_type order by document_type) into saved_document_types
  from public.seller_verification_documents where profile_id = applicant_id;
  if account.role = 'seller' and verification.phone is not null
     and (saved_document_types @> array['passport']
       or saved_document_types @> array['national_id_front', 'national_id_back']) then
    return '{}'::text[];
  end if;

  with previous_evidence as (
    delete from public.seller_verification_documents where profile_id = applicant_id
    returning storage_path
  )
  select coalesce(array_agg(storage_path), '{}') into old_paths from previous_evidence;

  insert into public.seller_verification_documents (
    profile_id, document_type, storage_path, display_name, mime_type, size_bytes
  )
  select applicant_id, document_type, storage_path, display_name, mime_type, size_bytes
  from jsonb_populate_recordset(null::public.seller_verification_documents, evidence);

  update public.seller_verifications
  set phone = listing_phone,
      phone_verified_at = case when phone = listing_phone then phone_verified_at else null end,
      updated_at = now()
  where profile_id = applicant_id;

  update public.profiles set role = 'seller', phone = listing_phone where id = applicant_id;

  return old_paths;
end;
$$;

revoke all on function public.save_private_seller_registration(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_private_seller_registration(uuid, text, jsonb)
  to service_role;

notify pgrst, 'reload schema';
