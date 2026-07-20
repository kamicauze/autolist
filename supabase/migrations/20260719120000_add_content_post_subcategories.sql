alter table public.content_posts
  add column if not exists subcategory text;

alter table public.content_posts
  drop constraint if exists content_posts_subcategory_check,
  add constraint content_posts_subcategory_check
    check (
      subcategory is null
      or subcategory in (
        'expert_reviews',
        'video_reviews',
        'test_drive',
        'comparison',
        'advice',
        'news',
        'car_launch',
        'opinion'
      )
    );

alter table public.content_posts
  drop constraint if exists content_posts_subcategory_category_check,
  add constraint content_posts_subcategory_category_check
    check (
      subcategory is null
      or (subcategory in ('expert_reviews', 'video_reviews', 'test_drive', 'comparison') and category = 'review')
      or (subcategory in ('news', 'car_launch') and category = 'news')
      or (subcategory in ('advice', 'opinion') and category = 'advice')
    );

create index if not exists idx_content_posts_subcategory_published_at
  on public.content_posts(subcategory, published_at desc)
  where status = 'published' and subcategory is not null;
