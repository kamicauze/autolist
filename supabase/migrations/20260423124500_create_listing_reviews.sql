create table if not exists public.listing_reviews (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (listing_id, reviewer_id)
);

create index if not exists idx_listing_reviews_listing_created
  on public.listing_reviews(listing_id, created_at desc);

create index if not exists idx_listing_reviews_seller_created
  on public.listing_reviews(seller_id, created_at desc);

alter table public.listing_reviews enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'listing_reviews'
      and policyname = 'Anyone can view listing reviews.'
  ) then
    create policy "Anyone can view listing reviews."
      on public.listing_reviews
      for select
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'listing_reviews'
      and policyname = 'Users create own listing reviews.'
  ) then
    create policy "Users create own listing reviews."
      on public.listing_reviews
      for insert
      with check (auth.uid() = reviewer_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'listing_reviews'
      and policyname = 'Users update own listing reviews.'
  ) then
    create policy "Users update own listing reviews."
      on public.listing_reviews
      for update
      using (auth.uid() = reviewer_id)
      with check (auth.uid() = reviewer_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'listing_reviews'
      and policyname = 'Users delete own listing reviews.'
  ) then
    create policy "Users delete own listing reviews."
      on public.listing_reviews
      for delete
      using (auth.uid() = reviewer_id);
  end if;
end $$;

create or replace function public.sync_listing_review_columns()
returns trigger
language plpgsql
as $$
declare
  resolved_seller_id uuid;
begin
  select seller_id
  into resolved_seller_id
  from public.listings
  where id = new.listing_id;

  if resolved_seller_id is null then
    raise exception 'Listing not found for review.';
  end if;

  if resolved_seller_id = new.reviewer_id then
    raise exception 'Sellers cannot review their own listing.';
  end if;

  new.seller_id := resolved_seller_id;
  new.updated_at := timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists sync_listing_review_columns
  on public.listing_reviews;

create trigger sync_listing_review_columns
before insert or update on public.listing_reviews
for each row
execute function public.sync_listing_review_columns();
