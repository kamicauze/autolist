create table if not exists public.seller_verifications (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected')),
  phone text,
  phone_verified_at timestamp with time zone,
  submitted_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint seller_verifications_phone_state_check check (
    (phone_verified_at is null)
    or (phone is not null and length(btrim(phone)) between 8 and 16)
  )
);

create table if not exists public.seller_verification_documents (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null
    check (document_type in ('national_id_front', 'national_id_back')),
  storage_path text not null unique,
  display_name text not null,
  mime_type text not null
    check (mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 6291456),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  unique (profile_id, document_type)
);

create table if not exists public.seller_phone_verification_challenges (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  phone text not null,
  code_digest text not null,
  expires_at timestamp with time zone not null,
  resend_available_at timestamp with time zone not null,
  attempt_count integer not null default 0 check (attempt_count between 0 and 5),
  consumed_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists seller_verifications_review_queue_idx
  on public.seller_verifications (status, submitted_at)
  where status = 'pending';

alter table public.seller_verifications enable row level security;
alter table public.seller_verification_documents enable row level security;
alter table public.seller_phone_verification_challenges enable row level security;

drop policy if exists "Sellers view own verification." on public.seller_verifications;
create policy "Sellers view own verification."
  on public.seller_verifications
  for select
  to authenticated
  using ((select auth.uid()) = profile_id);

drop policy if exists "Verification admins view seller verifications." on public.seller_verifications;
create policy "Verification admins view seller verifications."
  on public.seller_verifications
  for select
  to authenticated
  using (
    public.has_permission((select auth.uid()), 'admin.manage_users')
    or public.has_permission((select auth.uid()), 'admin.manage_dealers')
  );

drop policy if exists "Sellers view own verification document metadata." on public.seller_verification_documents;
create policy "Sellers view own verification document metadata."
  on public.seller_verification_documents
  for select
  to authenticated
  using ((select auth.uid()) = profile_id);

drop policy if exists "Verification admins view seller verification document metadata." on public.seller_verification_documents;
create policy "Verification admins view seller verification document metadata."
  on public.seller_verification_documents
  for select
  to authenticated
  using (
    public.has_permission((select auth.uid()), 'admin.manage_users')
    or public.has_permission((select auth.uid()), 'admin.manage_dealers')
  );

revoke all on public.seller_verifications from public, anon;
revoke all on public.seller_verification_documents from public, anon;
revoke all on public.seller_phone_verification_challenges from public, anon, authenticated;
grant select on public.seller_verifications to authenticated;
grant select on public.seller_verification_documents to authenticated;
grant all on public.seller_verifications to service_role;
grant all on public.seller_verification_documents to service_role;
grant all on public.seller_phone_verification_challenges to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'seller-kyc',
  'seller-kyc',
  false,
  6291456,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The seller-kyc bucket intentionally has no user-facing storage.objects
-- policies. Server actions verify the stored seller role and issue a short-
-- lived signed upload token for one exact object path. Reads are signed only
-- for an authenticated reviewer. The service role performs metadata writes
-- and cleanup, while the bucket remains private.
