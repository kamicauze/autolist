-- Signup metadata is user-controlled. Invited reps are assigned their role by
-- the server only after the invite token and membership have been validated.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := new.raw_user_meta_data->>'intended_role';

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case
      when requested_role in ('buyer', 'seller', 'dealer') then requested_role
      else 'buyer'
    end
  );

  return new;
end;
$$;
