alter table public.dealer_verification_documents
  add column if not exists uploaded_by uuid references public.profiles(id),
  add column if not exists display_name text,
  add column if not exists r2_key text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint,
  add column if not exists created_at timestamp with time zone
    default timezone('utc'::text, now());

update public.dealer_verification_documents as document
set
  uploaded_by = coalesce(document.uploaded_by, dealer.profile_id),
  display_name = coalesce(
    nullif(btrim(document.display_name), ''),
    initcap(replace(document.document_type, '_', ' '))
  ),
  r2_key = coalesce(nullif(btrim(document.r2_key), ''), document.file_url),
  created_at = coalesce(document.created_at, document.uploaded_at)
from public.dealers as dealer
where dealer.id = document.dealer_id
  and (
    document.uploaded_by is null
    or document.display_name is null
    or document.r2_key is null
    or document.created_at is null
  );

alter table public.dealer_verification_documents
  alter column file_url drop not null,
  alter column uploaded_by set not null,
  alter column display_name set not null,
  alter column r2_key set not null,
  alter column created_at set not null;

alter table public.dealer_verification_documents
  drop constraint if exists dealer_verification_documents_document_type_check;

alter table public.dealer_verification_documents
  add constraint dealer_verification_documents_document_type_check
  check (
    document_type in (
      'business_registration',
      'tax_certificate',
      'id_passport',
      'address_proof',
      'other',
      'company_logo',
      'contact_photo',
      'incorporation_certificate',
      'contact_id'
    )
  );

create index if not exists dealer_verification_documents_dealer_type_idx
  on public.dealer_verification_documents (dealer_id, document_type);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'dealer-kyc',
  'dealer-kyc',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The dealer-kyc bucket intentionally has no user-facing storage.objects
-- policies. Authenticated server actions verify dealer ownership before the
-- service role writes an exact object path. Reads are exposed only as short-
-- lived signed URLs after an owner or admin authorization check.
