-- ============================================================================
-- Normalize car trims from make-level rows to model-level rows.
-- Shared make-level trims are duplicated onto each model during seeding and
-- marked with is_shared = true.
-- ============================================================================

alter table public.car_trims
  add column if not exists model_id integer references public.car_models(id) on delete cascade,
  add column if not exists is_shared boolean not null default false;

-- Existing trim rows are make-scoped and cannot be mapped safely to a single
-- model. Clear the reference table and let the seed script repopulate it using
-- model-specific and inherited shared trims.
delete from public.car_trims;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'car_trims'
      and constraint_name = 'car_trims_make_id_name_key'
  ) then
    alter table public.car_trims drop constraint car_trims_make_id_name_key;
  end if;
end $$;

drop index if exists public.idx_car_trims_make_id;
drop index if exists public.car_trims_model_id_name_key;

alter table public.car_trims
  alter column model_id set not null;

alter table public.car_trims
  drop column if exists make_id;

create unique index car_trims_model_id_name_key
  on public.car_trims(model_id, name);

create index idx_car_trims_model_id
  on public.car_trims(model_id);

comment on table public.car_trims is
  'Trim levels per model. Shared make trims are duplicated to each model with is_shared=true.';

comment on column public.car_trims.is_shared is
  'True when the trim originated from a shared make-level catalog entry.';
