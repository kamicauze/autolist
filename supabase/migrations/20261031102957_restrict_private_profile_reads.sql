-- Apply after the public-profile projection and its application queries ship.
-- Full account data is available only to its owner and existing staff roles.
drop policy "Public profiles are viewable by everyone." on public.profiles;
create policy "Owners and staff can read private profiles."
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or public.is_staff((select auth.uid()))
);

notify pgrst, 'reload schema';
