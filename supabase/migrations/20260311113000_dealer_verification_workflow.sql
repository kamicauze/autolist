do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'dealers'
      and column_name = 'submitted_at'
  ) then
    alter table public.dealers
      add column submitted_at timestamp with time zone,
      add column reviewed_by uuid references public.profiles(id),
      add column reviewed_at timestamp with time zone,
      add column review_notes text,
      add column verification_notes text,
      add column preferred_confirmation_channel text default 'email'
        check (preferred_confirmation_channel in ('email', 'whatsapp', 'sms'));
  end if;
end $$;

create table if not exists public.dealer_verification_documents (
  id uuid default uuid_generate_v4() primary key,
  dealer_id uuid references public.dealers(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) not null,
  document_type text not null check (
    document_type in (
      'company_logo',
      'contact_photo',
      'incorporation_certificate',
      'contact_id'
    )
  ),
  display_name text not null,
  r2_key text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.dealer_verification_documents enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealers'
      and policyname = 'Admins view all dealer profiles.'
  ) then
    create policy "Admins view all dealer profiles."
      on public.dealers
      for select
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealers'
      and policyname = 'Admins update dealer profiles.'
  ) then
    create policy "Admins update dealer profiles."
      on public.dealers
      for update
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealer_verification_documents'
      and policyname = 'Owners view own dealer verification documents.'
  ) then
    create policy "Owners view own dealer verification documents."
      on public.dealer_verification_documents
      for select
      using (
        exists (
          select 1
          from public.dealers
          where dealers.id = dealer_verification_documents.dealer_id
            and dealers.profile_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealer_verification_documents'
      and policyname = 'Owners insert own dealer verification documents.'
  ) then
    create policy "Owners insert own dealer verification documents."
      on public.dealer_verification_documents
      for insert
      with check (
        uploaded_by = auth.uid()
        and exists (
          select 1
          from public.dealers
          where dealers.id = dealer_verification_documents.dealer_id
            and dealers.profile_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealer_verification_documents'
      and policyname = 'Owners delete own dealer verification documents.'
  ) then
    create policy "Owners delete own dealer verification documents."
      on public.dealer_verification_documents
      for delete
      using (
        exists (
          select 1
          from public.dealers
          where dealers.id = dealer_verification_documents.dealer_id
            and dealers.profile_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealer_verification_documents'
      and policyname = 'Admins view all dealer verification documents.'
  ) then
    create policy "Admins view all dealer verification documents."
      on public.dealer_verification_documents
      for select
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'Users insert own audit logs.'
  ) then
    create policy "Users insert own audit logs."
      on public.audit_logs
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.enforce_dealer_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean := exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
begin
  if tg_op = 'INSERT' then
    if not is_admin then
      new.status := 'PENDING';
      new.reviewed_by := null;
      new.reviewed_at := null;
      new.verified_by := null;
      new.verified_at := null;
      new.rejection_reason := null;
      new.review_notes := null;
    end if;

    new.updated_at := timezone('utc'::text, now());
    return new;
  end if;

  if not is_admin then
    if new.status is distinct from old.status then
      if new.status <> 'PENDING' then
        raise exception 'Only admins can update dealer review fields.';
      end if;

      new.reviewed_by := null;
      new.reviewed_at := null;
      new.verified_by := null;
      new.verified_at := null;
      new.rejection_reason := null;
      new.review_notes := null;
    elsif (
      new.reviewed_by is distinct from old.reviewed_by
      or new.reviewed_at is distinct from old.reviewed_at
      or new.verified_by is distinct from old.verified_by
      or new.verified_at is distinct from old.verified_at
      or new.rejection_reason is distinct from old.rejection_reason
      or new.review_notes is distinct from old.review_notes
    ) then
      raise exception 'Only admins can update dealer review fields.';
    end if;
  end if;

  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists enforce_dealer_admin_fields on public.dealers;

create trigger enforce_dealer_admin_fields
before insert or update on public.dealers
for each row
execute function public.enforce_dealer_admin_fields();
