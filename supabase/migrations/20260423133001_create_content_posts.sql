create table if not exists public.content_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  cover_image_url text,
  published_at timestamp with time zone,
  author text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint content_posts_status_published_at_check
    check (
      (status = 'draft' and published_at is null)
      or (status = 'published' and published_at is not null)
    )
);

create index if not exists idx_content_posts_status_published_at
  on public.content_posts(status, published_at desc, updated_at desc);

create index if not exists idx_content_posts_updated_at
  on public.content_posts(updated_at desc);

alter table public.content_posts enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_posts'
      and policyname = 'Published content posts are public.'
  ) then
    create policy "Published content posts are public."
      on public.content_posts
      for select
      using (status = 'published');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_posts'
      and policyname = 'Admins view all content posts.'
  ) then
    create policy "Admins view all content posts."
      on public.content_posts
      for select
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_posts'
      and policyname = 'Admins insert content posts.'
  ) then
    create policy "Admins insert content posts."
      on public.content_posts
      for insert
      with check (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_posts'
      and policyname = 'Admins update content posts.'
  ) then
    create policy "Admins update content posts."
      on public.content_posts
      for update
      using (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'admin'
        )
      );
  end if;
end $$;

create or replace function public.set_content_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_content_posts_updated_at
  on public.content_posts;

create trigger set_content_posts_updated_at
before update on public.content_posts
for each row
execute function public.set_content_posts_updated_at();
