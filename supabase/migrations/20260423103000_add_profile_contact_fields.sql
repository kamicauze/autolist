alter table public.profiles
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists bio text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists website text,
  add column if not exists facebook_url text,
  add column if not exists twitter_url text,
  add column if not exists instagram_url text,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

update public.profiles as profiles
set
  full_name = coalesce(
    nullif(btrim(profiles.full_name), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
    profiles.full_name
  ),
  avatar_url = coalesce(
    nullif(btrim(profiles.avatar_url), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'avatar_url'), ''),
    profiles.avatar_url
  ),
  phone = coalesce(
    nullif(btrim(profiles.phone), ''),
    nullif(btrim(coalesce(users.raw_user_meta_data ->> 'phone', users.raw_user_meta_data ->> 'phone_number')), ''),
    profiles.phone
  ),
  whatsapp = coalesce(
    nullif(btrim(profiles.whatsapp), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'whatsapp'), ''),
    profiles.whatsapp
  ),
  bio = coalesce(
    nullif(btrim(profiles.bio), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'bio'), ''),
    profiles.bio
  ),
  city = coalesce(
    nullif(btrim(profiles.city), ''),
    nullif(btrim(coalesce(users.raw_user_meta_data ->> 'city', users.raw_user_meta_data ->> 'location')), ''),
    profiles.city
  ),
  address = coalesce(
    nullif(btrim(profiles.address), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'address'), ''),
    profiles.address
  ),
  website = coalesce(
    nullif(btrim(profiles.website), ''),
    nullif(btrim(coalesce(users.raw_user_meta_data ->> 'website', users.raw_user_meta_data ->> 'business_website')), ''),
    profiles.website
  ),
  facebook_url = coalesce(
    nullif(btrim(profiles.facebook_url), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'facebook'), ''),
    profiles.facebook_url
  ),
  twitter_url = coalesce(
    nullif(btrim(profiles.twitter_url), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'twitter'), ''),
    profiles.twitter_url
  ),
  instagram_url = coalesce(
    nullif(btrim(profiles.instagram_url), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'instagram'), ''),
    profiles.instagram_url
  )
from auth.users as users
where users.id = profiles.id;

update public.profiles as profiles
set
  phone = coalesce(
    nullif(btrim(profiles.phone), ''),
    nullif(btrim(dealers.mobile), ''),
    profiles.phone
  ),
  whatsapp = coalesce(
    nullif(btrim(profiles.whatsapp), ''),
    nullif(btrim(dealers.whatsapp), ''),
    profiles.whatsapp
  ),
  bio = coalesce(
    nullif(btrim(profiles.bio), ''),
    nullif(btrim(dealers.about_text), ''),
    profiles.bio
  ),
  city = coalesce(
    nullif(btrim(profiles.city), ''),
    nullif(btrim(dealers.city), ''),
    profiles.city
  ),
  address = coalesce(
    nullif(btrim(profiles.address), ''),
    nullif(btrim(dealers.address), ''),
    profiles.address
  ),
  website = coalesce(
    nullif(btrim(profiles.website), ''),
    nullif(btrim(dealers.website), ''),
    profiles.website
  ),
  facebook_url = coalesce(
    nullif(btrim(profiles.facebook_url), ''),
    nullif(btrim(dealers.social_links ->> 'facebook'), ''),
    profiles.facebook_url
  ),
  twitter_url = coalesce(
    nullif(btrim(profiles.twitter_url), ''),
    nullif(btrim(coalesce(dealers.social_links ->> 'twitter', dealers.social_links ->> 'x')), ''),
    profiles.twitter_url
  ),
  instagram_url = coalesce(
    nullif(btrim(profiles.instagram_url), ''),
    nullif(btrim(dealers.social_links ->> 'instagram'), ''),
    profiles.instagram_url
  )
from public.dealers as dealers
where dealers.profile_id = profiles.id;

do $$
begin
  if exists (
    select 1
    from pg_proc
    where proname = 'touch_updated_at'
  ) and not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_profiles_updated_at'
      and tgrelid = 'public.profiles'::regclass
  ) then
    create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.touch_updated_at();
  end if;
end
$$;
