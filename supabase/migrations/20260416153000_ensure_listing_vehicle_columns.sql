alter table public.listings add column if not exists seats integer;
alter table public.listings add column if not exists doors integer;
alter table public.listings add column if not exists drive_type text;
