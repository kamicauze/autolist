-- Add seats, doors, and drive_type columns to listings table
alter table public.listings add column seats integer;
alter table public.listings add column doors integer;
alter table public.listings add column drive_type text;
