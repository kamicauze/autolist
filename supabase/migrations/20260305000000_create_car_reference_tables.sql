-- ============================================================================
-- Car Reference Tables: makes, models, trims, variants
-- These are lookup/suggestion tables for dropdowns. The listings table keeps
-- make/model as plain text (no FK constraint).
-- ============================================================================

-- ── car_makes ────────────────────────────────────────────────────────────────
create table public.car_makes (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  logo_url text,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.car_makes is 'Reference table of car manufacturers/brands';

-- ── car_models ───────────────────────────────────────────────────────────────
create table public.car_models (
  id serial primary key,
  make_id integer not null references public.car_makes(id) on delete cascade,
  name text not null,
  slug text not null,
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(make_id, slug)
);

create index idx_car_models_make_id on public.car_models(make_id);

comment on table public.car_models is 'Car models belonging to a make';

-- ── car_trims ────────────────────────────────────────────────────────────────
create table public.car_trims (
  id serial primary key,
  make_id integer not null references public.car_makes(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(make_id, name)
);

create index idx_car_trims_make_id on public.car_trims(make_id);

comment on table public.car_trims is 'Trim levels per make (e.g. Sport, Luxury, RS)';

-- ── car_variants ─────────────────────────────────────────────────────────────
create table public.car_variants (
  id serial primary key,
  model_id integer not null references public.car_models(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(model_id, name)
);

create index idx_car_variants_model_id on public.car_variants(model_id);

comment on table public.car_variants is 'Engine/sub-model variants (e.g. BMW 3 Series → 316i, 318i)';

-- ── RLS: public read, admin-only write ───────────────────────────────────────

-- car_makes
alter table public.car_makes enable row level security;

create policy "Car makes are publicly readable"
  on public.car_makes for select
  using (true);

create policy "Only admins can insert car makes"
  on public.car_makes for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update car makes"
  on public.car_makes for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete car makes"
  on public.car_makes for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- car_models
alter table public.car_models enable row level security;

create policy "Car models are publicly readable"
  on public.car_models for select
  using (true);

create policy "Only admins can insert car models"
  on public.car_models for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update car models"
  on public.car_models for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete car models"
  on public.car_models for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- car_trims
alter table public.car_trims enable row level security;

create policy "Car trims are publicly readable"
  on public.car_trims for select
  using (true);

create policy "Only admins can insert car trims"
  on public.car_trims for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update car trims"
  on public.car_trims for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete car trims"
  on public.car_trims for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- car_variants
alter table public.car_variants enable row level security;

create policy "Car variants are publicly readable"
  on public.car_variants for select
  using (true);

create policy "Only admins can insert car variants"
  on public.car_variants for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update car variants"
  on public.car_variants for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete car variants"
  on public.car_variants for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
