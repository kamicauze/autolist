do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dealers'
      and policyname = 'Owners insert own dealer profile.'
  ) then
    create policy "Owners insert own dealer profile."
      on public.dealers
      for insert
      with check (auth.uid() = profile_id);
  end if;
end $$;
