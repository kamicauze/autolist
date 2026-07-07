do $$
declare
  existing_constraint_name text;
begin
  select conname
    into existing_constraint_name
  from pg_constraint
  where conrelid = 'public.content_posts'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%category%'
    and pg_get_constraintdef(oid) ilike '%news_advice%'
  limit 1;

  if existing_constraint_name is not null then
    execute format(
      'alter table public.content_posts drop constraint %I',
      existing_constraint_name
    );
  end if;
end $$;

alter table public.content_posts
  drop constraint if exists content_posts_category_check;

update public.content_posts
set category = 'advice'
where category = 'news_advice';

alter table public.content_posts
  alter column category set default 'blog',
  add constraint content_posts_category_check
    check (category in ('blog', 'review', 'news', 'advice', 'faq'));
