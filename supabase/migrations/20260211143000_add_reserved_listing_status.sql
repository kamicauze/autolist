do $$
declare
  existing_constraint text;
begin
  select conname
  into existing_constraint
  from pg_constraint
  where conrelid = 'public.listings'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%'
  order by conname
  limit 1;

  if existing_constraint is not null then
    execute format(
      'alter table public.listings drop constraint %I',
      existing_constraint
    );
  end if;

  alter table public.listings
    add constraint listings_status_check
    check (
      status in (
        'draft',
        'pending',
        'active',
        'reserved',
        'rejected',
        'sold',
        'expired'
      )
    );
end $$;
