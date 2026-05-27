alter table public.content_posts
  add column if not exists category text not null default 'blog'
    check (category in ('blog', 'review', 'news_advice', 'faq')),
  add column if not exists gallery_image_urls text[] not null default '{}';

create index if not exists idx_content_posts_category_published_at
  on public.content_posts(category, published_at desc, updated_at desc)
  where status = 'published';
