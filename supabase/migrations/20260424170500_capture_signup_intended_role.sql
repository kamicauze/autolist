create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;
