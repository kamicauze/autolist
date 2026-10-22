/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  isContentPostCategory,
  normalizeContentPostCategory,
} from "@/lib/content-post-categories";
import {
  CONTENT_POST_SUBCATEGORY_OPTIONS,
  getContentPostSubcategoryLabel,
  isContentPostSubcategory,
} from "@/lib/content-post-subcategories";
import { getPublishedContentPosts } from "@/lib/data/content-posts";
import type { ContentPost } from "@/lib/types/content-posts";

const tabs = [
  { label: "All", query: "" },
  { label: "Car Reviews", query: "category=review" },
  { label: "Buying & Selling", query: "category=blog" },
  { label: "Advice & Maintenance", query: "category=advice" },
  { label: "News", query: "category=news" },
  {
    label: "Comparisons",
    query: "section=reviews_blogs&subcategory=comparison",
  },
];

function Story({
  post,
  featured = false,
  compact = false,
}: {
  post: ContentPost;
  featured?: boolean;
  compact?: boolean;
}) {
  const label =
    getContentPostSubcategoryLabel(post.subcategory) ??
    {
      blog: "Buying & Selling",
      review: "Car Review",
      advice: "Advice",
      news: "News",
      faq: "FAQ",
    }[post.category];
  return (
    <article
      className={
        compact
          ? "grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-gray-200 pb-5 last:border-0 sm:grid-cols-[144px_minmax(0,1fr)]"
          : "min-w-0"
      }
    >
      <Link
        href={`/blog/${post.slug}`}
        className={`block overflow-hidden rounded-lg bg-gray-100 ${compact ? "self-start" : "mb-4"}`}
        aria-label={`Read ${post.title}`}
      >
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            loading={featured ? "eager" : "lazy"}
            className={`w-full object-contain ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}
          />
        ) : (
          <div
            className={
              featured
                ? "aspect-[16/9] bg-gray-100"
                : "aspect-[4/3] bg-gray-100"
            }
          />
        )}
      </Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {label}
        </p>
        <h2
          className={`mt-2 font-bold leading-snug text-gray-900 ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}
        >
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        <p
          className={`mt-2 text-sm leading-6 text-gray-600 ${compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {post.excerpt}
        </p>
        <p className="mt-3 text-xs text-gray-500">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Africa/Nairobi",
              })
            : ""}
          {post.author ? ` · ${post.author}` : ""}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          {post.category === "review" ? "Read review" : "Read article"}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    section?: string;
    subcategory?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const category =
    isContentPostCategory(params.category) || params.category === "news_advice"
      ? normalizeContentPostCategory(params.category)
      : undefined;
  const section =
    params.section === "reviews_blogs" ||
    params.section === "news_advice" ||
    params.section === "faq"
      ? params.section
      : undefined;
  const subcategory = isContentPostSubcategory(params.subcategory)
    ? params.subcategory
    : undefined;
  const filter =
    category ??
    (section === "reviews_blogs"
      ? "reviews_blogs"
      : section === "news_advice"
        ? "car_news_advice"
        : section === "faq"
          ? "faq"
          : undefined);
  const page = /^\d+$/.test(params.page ?? "")
    ? Math.max(1, Math.min(10000, Number(params.page)))
    : 1;
  const [results, guides] = await Promise.all([
    getPublishedContentPosts(13, filter, subcategory, (page - 1) * 12),
    !filter && !subcategory && page === 1
      ? getPublishedContentPosts(4, "advice")
      : Promise.resolve([]),
  ]);
  const posts = results.slice(0, 12);
  const [featured, ...remaining] = posts;
  const showFeatured = page === 1 && Boolean(featured);
  const latest = showFeatured ? remaining.slice(3) : posts;
  const activeQuery = new URLSearchParams();
  if (category) activeQuery.set("category", category);
  if (section) activeQuery.set("section", section);
  if (subcategory) activeQuery.set("subcategory", subcategory);
  const paginationHref = (target: number) => {
    const query = new URLSearchParams(activeQuery);
    if (target > 1) query.set("page", String(target));
    return `/blog${query.size ? `?${query}` : ""}`;
  };
  const activeTab =
    subcategory === "comparison"
      ? "Comparisons"
      : category === "review" || section === "reviews_blogs"
        ? "Car Reviews"
        : category === "blog"
          ? "Buying & Selling"
          : category === "advice"
            ? "Advice & Maintenance"
            : category === "news" || section === "news_advice"
              ? "News"
              : "All";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "News & Reviews" }]}
          />
          <header className="pb-8 pt-8 sm:pt-12">
            <p className="text-sm font-semibold text-primary">News & Reviews</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
              Cars, reviews and advice for Kenya’s drivers.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Expert reviews, practical buying guides and the latest motoring
              news to help you make your next move.
            </p>
          </header>
          <nav
            aria-label="Article topics"
            className="flex flex-wrap gap-x-6 gap-y-3 border-y border-gray-200 py-4"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={`/blog${tab.query ? `?${tab.query}` : ""}`}
                aria-current={activeTab === tab.label ? "page" : undefined}
                className={`border-b-2 pb-1 text-sm font-semibold ${activeTab === tab.label ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-primary"}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          {section === "reviews_blogs" || section === "news_advice" ? (
            <nav
              aria-label="More article topics"
              className="flex flex-wrap gap-5 border-b border-gray-200 py-4"
            >
              {CONTENT_POST_SUBCATEGORY_OPTIONS[section].map((option) => (
                <Link
                  key={option.value}
                  href={`/blog?section=${section}&subcategory=${option.value}`}
                  aria-current={
                    subcategory === option.value ? "page" : undefined
                  }
                  className={`text-sm ${subcategory === option.value ? "font-semibold text-primary" : "text-gray-600 hover:text-primary"}`}
                >
                  {option.label}
                </Link>
              ))}
            </nav>
          ) : null}
          {showFeatured ? (
            <section
              aria-label="Featured stories"
              className="grid gap-8 border-b border-gray-200 py-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
            >
              <Story post={featured} featured />
              <div className="space-y-5">
                {remaining.slice(0, 3).map((post) => (
                  <Story key={post.id} post={post} compact />
                ))}
              </div>
            </section>
          ) : null}
          {latest.length > 0 ? (
            <section className="py-10">
              <h2 className="mb-7 text-2xl font-bold text-gray-900">
                Latest from Autolist
              </h2>
              <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((post) => (
                  <Story key={post.id} post={post} />
                ))}
              </div>
            </section>
          ) : null}
          {posts.length === 0 ? (
            <p className="py-16 text-gray-600">
              No articles have been published for this selection yet.{" "}
              <Link
                href="/blog"
                className="font-semibold text-primary hover:underline"
              >
                Browse all stories
              </Link>
              .
            </p>
          ) : null}
          {page > 1 || results.length > 12 ? (
            <nav
              aria-label="Article pages"
              className="flex items-center justify-between border-t border-gray-200 py-6"
            >
              {page > 1 ? (
                <Link
                  href={paginationHref(page - 1)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-gray-500">Page {page}</span>
              {results.length > 12 ? (
                <Link
                  href={paginationHref(page + 1)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
          {guides.length > 0 ? (
            <section className="border-t border-gray-200 pt-10">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Car Buying & Ownership
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Practical guides for choosing, selling and looking after
                    your car.
                  </p>
                </div>
                <Link
                  href="/blog?category=advice"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all advice →
                </Link>
              </div>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
                {guides.map((post) => (
                  <Story key={post.id} post={post} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
