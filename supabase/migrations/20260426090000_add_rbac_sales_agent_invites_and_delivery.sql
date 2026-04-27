alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('buyer', 'seller', 'dealer', 'sales_agent', 'support', 'admin', 'super_admin'));

create or replace function public.is_staff(user_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role in ('support', 'admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin(user_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'super_admin'
  );
$$;

create table if not exists public.permissions (
  key text primary key,
  label text not null,
  description text,
  category text not null default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.role_permissions (
  role text not null check (role in ('buyer', 'seller', 'dealer', 'sales_agent', 'support', 'admin', 'super_admin')),
  permission_key text not null references public.permissions(key) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (role, permission_key)
);

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "Staff view permissions." on public.permissions;
create policy "Staff view permissions."
  on public.permissions
  for select
  using (public.is_staff(auth.uid()));

drop policy if exists "Super admins manage permissions." on public.permissions;
create policy "Super admins manage permissions."
  on public.permissions
  for all
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

drop policy if exists "Staff view role permissions." on public.role_permissions;
create policy "Staff view role permissions."
  on public.role_permissions
  for select
  using (public.is_staff(auth.uid()));

drop policy if exists "Super admins manage role permissions." on public.role_permissions;
create policy "Super admins manage role permissions."
  on public.role_permissions
  for all
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

insert into public.permissions (key, label, description, category)
values
  ('admin.access', 'Access admin console', 'Open the admin shell and live admin pages.', 'Admin'),
  ('admin.manage_users', 'Manage users', 'View user accounts and update account state.', 'Admin'),
  ('admin.manage_roles', 'Manage roles and permissions', 'Assign staff roles and update role-permission mappings.', 'Admin'),
  ('admin.manage_listings', 'Manage all listings', 'Moderate, update, feature, expire, or delete any listing.', 'Listings'),
  ('admin.review_listings', 'Review listings', 'Approve or reject pending listing submissions.', 'Listings'),
  ('admin.manage_dealers', 'Manage dealer verification', 'Review dealer KYC and verification workflows.', 'Dealers'),
  ('admin.manage_cms', 'Manage CMS content', 'Edit pages, homepage content, banners, and managed public content.', 'CMS'),
  ('admin.manage_settings', 'Manage platform settings', 'Update operational settings and provider configuration.', 'Settings'),
  ('support.manage_tickets', 'Manage support tickets', 'View and respond to buyer, seller, and support queues.', 'Support'),
  ('notifications.manage_delivery', 'Manage notification delivery', 'Process queued email and WhatsApp deliveries.', 'Notifications'),
  ('dealer.manage_sales_agents', 'Manage sales agents', 'Invite and maintain dealer sales reps.', 'Dealers'),
  ('listings.manage_own', 'Manage own listings', 'Create and manage listings owned by the account.', 'Listings')
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category;

insert into public.role_permissions (role, permission_key)
select 'super_admin', key from public.permissions
on conflict do nothing;

insert into public.role_permissions (role, permission_key)
values
  ('admin', 'admin.access'),
  ('admin', 'admin.manage_users'),
  ('admin', 'admin.manage_listings'),
  ('admin', 'admin.review_listings'),
  ('admin', 'admin.manage_dealers'),
  ('admin', 'admin.manage_cms'),
  ('admin', 'admin.manage_settings'),
  ('admin', 'support.manage_tickets'),
  ('admin', 'notifications.manage_delivery'),
  ('support', 'admin.access'),
  ('support', 'support.manage_tickets'),
  ('support', 'admin.review_listings'),
  ('dealer', 'dealer.manage_sales_agents'),
  ('dealer', 'listings.manage_own'),
  ('seller', 'listings.manage_own'),
  ('sales_agent', 'listings.manage_own')
on conflict do nothing;

create or replace function public.has_permission(user_id uuid, permission text)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and (
        p.role = 'super_admin'
        or exists (
          select 1
          from public.role_permissions rp
          where rp.role = p.role
            and rp.permission_key = permission
        )
      )
  );
$$;

alter table public.dealer_sales_agents
  add column if not exists agent_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists invite_status text not null default 'not_sent'
    check (invite_status in ('not_sent', 'pending', 'accepted', 'expired', 'revoked')),
  add column if not exists invite_token_hash text unique,
  add column if not exists invite_expires_at timestamp with time zone,
  add column if not exists invite_sent_at timestamp with time zone,
  add column if not exists invite_accepted_at timestamp with time zone,
  add column if not exists invited_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_dealer_sales_agents_agent_profile_id
  on public.dealer_sales_agents(agent_profile_id);

create index if not exists idx_dealer_sales_agents_invite_status
  on public.dealer_sales_agents(invite_status);

create index if not exists idx_dealer_sales_agents_invite_token_hash
  on public.dealer_sales_agents(invite_token_hash);

drop policy if exists "Admins manage dealer sales agents." on public.dealer_sales_agents;
create policy "Admins manage dealer sales agents."
  on public.dealer_sales_agents
  for all
  using (public.has_permission(auth.uid(), 'admin.manage_dealers'))
  with check (public.has_permission(auth.uid(), 'admin.manage_dealers'));

alter table public.notification_deliveries
  add column if not exists external_message_id text,
  add column if not exists last_error text,
  add column if not exists attempt_count integer not null default 0;

create index if not exists idx_notification_deliveries_channel_status
  on public.notification_deliveries(channel, status, created_at);

drop policy if exists "Admins view all content pages." on public.content_pages;
create policy "Admins view all content pages."
  on public.content_pages
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins insert content pages." on public.content_pages;
create policy "Admins insert content pages."
  on public.content_pages
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins update content pages." on public.content_pages;
create policy "Admins update content pages."
  on public.content_pages
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_cms'))
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins view platform settings." on public.platform_settings;
create policy "Admins view platform settings."
  on public.platform_settings
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_settings'));

drop policy if exists "Admins insert platform settings." on public.platform_settings;
create policy "Admins insert platform settings."
  on public.platform_settings
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_settings'));

drop policy if exists "Admins update platform settings." on public.platform_settings;
create policy "Admins update platform settings."
  on public.platform_settings
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_settings'))
  with check (public.has_permission(auth.uid(), 'admin.manage_settings'));

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
      when requested_role in ('buyer', 'seller', 'dealer', 'sales_agent') then requested_role
      else 'buyer'
    end
  );

  return new;
end;
$$ language plpgsql security definer;
