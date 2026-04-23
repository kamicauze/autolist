create table if not exists public.content_pages (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  title text not null,
  summary text,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_content_pages_status_slug
  on public.content_pages(status, slug);

alter table public.content_pages enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_pages'
      and policyname = 'Published content pages are public.'
  ) then
    create policy "Published content pages are public."
      on public.content_pages
      for select
      using (status = 'published');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_pages'
      and policyname = 'Admins view all content pages.'
  ) then
    create policy "Admins view all content pages."
      on public.content_pages
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
      and tablename = 'content_pages'
      and policyname = 'Admins insert content pages.'
  ) then
    create policy "Admins insert content pages."
      on public.content_pages
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
      and tablename = 'content_pages'
      and policyname = 'Admins update content pages.'
  ) then
    create policy "Admins update content pages."
      on public.content_pages
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

create or replace function public.set_content_page_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_content_page_updated_at
  on public.content_pages;

create trigger set_content_page_updated_at
before update on public.content_pages
for each row
execute function public.set_content_page_updated_at();

insert into public.content_pages (
  slug,
  title,
  summary,
  body,
  status,
  seo_title,
  seo_description,
  published_at
)
values
  (
    'about',
    'About Autolist',
    'Autolist helps buyers, sellers, and dealers across Kenya move with more confidence.',
    'Autolist is a vehicle marketplace built to make car buying and selling clearer, faster, and more trustworthy.

We focus on practical listing tools, better discovery, and straightforward communication between buyers and sellers.

Our goal is simple: help serious buyers find the right car and help serious sellers close with less friction.',
    'published',
    'About Autolist',
    'Learn what Autolist does and how we support vehicle buyers, sellers, and dealers in Kenya.',
    timezone('utc'::text, now())
  ),
  (
    'how-it-works',
    'How Autolist Works',
    'A simple process for listing a vehicle, discovering options, and contacting the right seller.',
    'Sellers create a listing with the key vehicle details, pricing, and photos buyers need to evaluate quickly.

Buyers explore live inventory, compare options, and reach out directly when they find a good fit.

The platform is designed to reduce guesswork, surface useful details early, and keep the transaction flow practical.',
    'published',
    'How Autolist Works',
    'See how Autolist helps sellers publish listings and helps buyers discover and compare vehicles.',
    timezone('utc'::text, now())
  ),
  (
    'careers',
    'Careers',
    'We care about practical builders who like clear systems, clean execution, and measurable progress.',
    'Autolist is building a marketplace experience that respects users'' time and supports real transactions.

We value people who work clearly, move with urgency, and improve systems instead of adding noise.

If you are interested in future roles, reach out through the business contact channels listed on the platform.',
    'published',
    'Careers at Autolist',
    'Learn about the kind of work and team mindset Autolist is building as the platform grows.',
    timezone('utc'::text, now())
  ),
  (
    'faqs',
    'Frequently Asked Questions',
    'Answers to common questions about listings, contacting sellers, and using the marketplace.',
    'Listings are created by individual sellers and dealers, and details may change as vehicles are updated or sold.

Buyers should confirm availability, price, condition, and paperwork directly with the seller before making a commitment.

If you need help with the platform itself, use the available support channels so the team can review the issue.',
    'published',
    'Autolist FAQs',
    'Read frequently asked questions about Autolist, vehicle listings, and contacting sellers.',
    timezone('utc'::text, now())
  ),
  (
    'privacy',
    'Privacy Policy',
    'A high-level explanation of what information the platform handles and how it is used.',
    'Autolist collects the account, listing, and communication data needed to operate the marketplace and support user requests.

We use that information to run the service, improve product quality, prevent abuse, and respond to support or compliance needs.

Personal data is handled according to applicable legal requirements and internal access controls.',
    'published',
    'Privacy Policy | Autolist',
    'Read the Autolist privacy policy for a summary of how platform data is collected and used.',
    timezone('utc'::text, now())
  ),
  (
    'terms',
    'Terms of Use',
    'The main conditions that apply when using Autolist, publishing listings, or contacting other users.',
    'By using Autolist, you agree to provide accurate information and use the platform lawfully and in good faith.

Sellers are responsible for the accuracy of their listings, and buyers are responsible for carrying out appropriate due diligence.

Autolist may remove content, limit access, or take other moderation steps when platform rules or legal requirements are not met.',
    'published',
    'Terms of Use | Autolist',
    'Review the core terms that govern using Autolist and publishing or responding to listings.',
    timezone('utc'::text, now())
  )
on conflict (slug) do nothing;
