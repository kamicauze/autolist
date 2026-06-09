create table if not exists public.listing_reports (
  id uuid default uuid_generate_v4() primary key,
  target_type text not null default 'listing' check (target_type in ('listing', 'dealer')),
  listing_id uuid references public.listings(id) on delete set null,
  dealer_id uuid references public.dealers(id) on delete set null,
  reporter_profile_id uuid references public.profiles(id) on delete set null,
  reporter_name text not null,
  reporter_phone text not null,
  reporter_email text not null,
  reporter_location text not null,
  reason text not null,
  reason_label text not null,
  comments text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  admin_note text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint listing_reports_target_check check (
    (target_type = 'listing' and listing_id is not null)
    or (target_type = 'dealer' and dealer_id is not null)
  )
);

create index if not exists idx_listing_reports_status_priority
  on public.listing_reports(status, priority, updated_at desc);

create index if not exists idx_listing_reports_listing_id
  on public.listing_reports(listing_id);

create index if not exists idx_listing_reports_dealer_id
  on public.listing_reports(dealer_id);

drop trigger if exists trg_listing_reports_updated_at on public.listing_reports;
create trigger trg_listing_reports_updated_at
before update on public.listing_reports
for each row execute procedure public.touch_updated_at();

alter table public.listing_reports enable row level security;

drop policy if exists "Staff can view listing reports." on public.listing_reports;
create policy "Staff can view listing reports."
on public.listing_reports
for select
using (public.is_staff(auth.uid()));

drop policy if exists "Staff can update listing reports." on public.listing_reports;
create policy "Staff can update listing reports."
on public.listing_reports
for update
using (public.is_staff(auth.uid()))
with check (public.is_staff(auth.uid()));
