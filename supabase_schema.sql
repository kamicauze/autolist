-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'buyer' check (role in ('buyer', 'seller', 'dealer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. DEALERS (Verified Business Info)
create table public.dealers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) not null unique, -- One dealer per user for now
  
  -- Core Info
  name text not null, -- Display Name
  business_name text, -- Registered Name
  status text default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  
  -- Contact
  address text,
  city text,
  location text,
  mobile text not null,
  email text not null,
  whatsapp text not null,
  website text,
  
  -- Branding
  logo_url text,
  about_text text,
  social_links jsonb, -- { "facebook": "...", "instagram": "..." }
  
  -- Personnel (Primary Contact)
  contact_person jsonb not null, -- { "name": "...", "role": "...", "mobile": "..." }
  
  -- Verification (Private R2 Keys)
  doc_incorporation_key text,
  doc_id_key text,
  verified_by uuid references public.profiles(id),
  verified_at timestamp with time zone,
  rejection_reason text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Dealers
alter table public.dealers enable row level security;
-- Public can see APPROVED dealers
create policy "Approved dealers are public." on public.dealers for select using (status = 'APPROVED');
-- Owners see their own (even if pending)
create policy "Owners view own dealer profile." on public.dealers for select using (auth.uid() = profile_id);
-- Owners can create their own dealer profile
create policy "Owners insert own dealer profile." on public.dealers for insert with check (auth.uid() = profile_id);
-- Owners can update own (except status)
create policy "Owners update own dealer profile." on public.dealers for update using (auth.uid() = profile_id); -- Note: Needs generic update, specific column security is separate or handled by API logic
-- Admins (TODO: Add admin specific policy later, for now relying on Service Role for verification)


-- 3. LISTINGS
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) not null,
  dealer_id uuid references public.dealers(id), -- Nullable if private seller
  
  status text default 'draft' check (status in ('draft', 'pending', 'active', 'reserved', 'rejected', 'sold', 'expired')),
  
  -- Vehicle Data
  make text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  currency text default 'KES',
  mileage integer,
  body_type text,
  transmission text,
  fuel_type text,
  color text,
  condition text, -- 'new', 'used', 'foreign_used'
  
  description text,
  features jsonb, -- ['Sunroof', 'Leather Seats']
  metadata jsonb, -- AI tags, etc.
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Listings
alter table public.listings enable row level security;
create policy "Active listings are public." on public.listings for select using (status = 'active');
create policy "Owners view all their listings." on public.listings for select using (auth.uid() = seller_id);
create policy "Owners insert listings." on public.listings for insert with check (auth.uid() = seller_id);
create policy "Owners update own listings." on public.listings for update using (auth.uid() = seller_id);


-- 4. LISTING IMAGES (References to Cloudflare R2)
create table public.listing_images (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  
  r2_key text not null, -- The path in the bucket (e.g., 'listings/123/image_1.webp')
  alt_text text,
  image_order integer default 0,
  is_watermarked boolean default false,
  image_hash text, -- MD5 hash for duplicate detection
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Images
alter table public.listing_images enable row level security;
create policy "Images are public via listing." on public.listing_images for select using ( exists ( select 1 from public.listings where id = listing_images.listing_id and status = 'active' ) );
create policy "Owners view own images." on public.listing_images for select using ( exists ( select 1 from public.listings where id = listing_images.listing_id and seller_id = auth.uid() ) );
create policy "Owners insert images." on public.listing_images for insert with check ( exists ( select 1 from public.listings where id = listing_images.listing_id and seller_id = auth.uid() ) );
create policy "Owners delete images." on public.listing_images for delete using ( exists ( select 1 from public.listings where id = listing_images.listing_id and seller_id = auth.uid() ) );


-- 5. ENQUIRIES (Leads)
create table public.enquiries (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  user_id uuid references public.profiles(id) not null, -- Sender
  
  message text not null,
  status text default 'pending' check (status in ('pending', 'read', 'replied', 'closed')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Enquiries
alter table public.enquiries enable row level security;
-- Senders can see their own enquiries
create policy "Senders view own enquiries." on public.enquiries for select using (auth.uid() = user_id);
-- Sellers (receivers) can see enquiries for their listings
create policy "Sellers view enquiries for their listings." on public.enquiries for select using (
  exists (
    select 1 from public.listings 
    where listings.id = enquiries.listing_id 
    and listings.seller_id = auth.uid()
  )
);
-- Senders can insert
create policy "Users create enquiries." on public.enquiries for insert with check (auth.uid() = user_id);


-- 6. WISHLISTS (Favorites)
create table public.wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  listing_id uuid references public.listings(id) not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, listing_id) -- Prevent duplicate favorites
);

-- RLS for Wishlists
alter table public.wishlists enable row level security;
create policy "Users view own wishlist." on public.wishlists for select using (auth.uid() = user_id);
create policy "Users manage own wishlist." on public.wishlists for all using (auth.uid() = user_id);


-- 7. PAYMENTS (Platform Services)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  reference text unique not null, -- External Ref (Stripe ID / M-Pesa Receipt)
  
  provider text not null check (provider in ('stripe', 'mpesa')),
  amount numeric not null,
  currency text default 'KES',
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  purpose text not null, -- 'listing_fee', 'subscription', 'verification_fee'
  metadata jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Payments
alter table public.payments enable row level security;
create policy "Users create payments." on public.payments for insert with check (auth.uid() = user_id);
create policy "Users view own payments." on public.payments for select using (auth.uid() = user_id);
-- Only Admin/Service Role can update payment status (via Webhooks)


-- 8. AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id), -- Nullable (system events)
  action text not null, -- 'listing_created', 'dealer_verified'
  entity_type text not null, -- 'listing', 'dealer'
  entity_id uuid,
  details jsonb,
  
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Audit Logs
alter table public.audit_logs enable row level security;
-- Admins only
create policy "Admins view audit logs." on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- No public insert (handled by triggers or backend functions)
