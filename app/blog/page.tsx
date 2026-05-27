/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getPublishedContentPosts } from "@/lib/data/content-posts";
import type { ContentPostCategory } from "@/lib/types/content-posts";

const BLOG_CATEGORIES: Array<{ value: ContentPostCategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "blog", label: "Blog" },
  { value: "review", label: "Reviews" },
  { value: "news_advice", label: "News and advice" },
  { value: "faq", label: "FAQ" },
];

function isContentPostCategory(value: unknown): value is ContentPostCategory {
  return value === "blog" || value === "review" || value === "news_advice" || value === "faq";
}

function getCategoryLabel(category: ContentPostCategory) {
  return BLOG_CATEGORIES.find((option) => option.value === category)?.label ?? "Blog";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unpublished";
  }

  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = isContentPostCategory(params.category) ? params.category : undefined;
  const posts = await getPublishedContentPosts(24, activeCategory);
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog" },
            ]}
            className="mb-4"
          />

          <section className="rounded-[28px] border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              Autolist Blog
            </p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              News, guides, and market reads for car buyers and sellers.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
              Read straightforward advice from the Autolist team on buying, selling, pricing,
              and understanding the local market.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  href={category.value === "all" ? "/blog" : `/blog?category=${category.value}`}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    (activeCategory ?? "all") === category.value
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </section>

          {featuredPost ? (
            <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
              <article className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
                {featuredPost.coverImageUrl ? (
                  <img
                    src={featuredPost.coverImageUrl}
                    alt={featuredPost.title}
                    className="h-60 w-full object-cover sm:h-72"
                  />
                ) : (
                  <div className="h-60 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 sm:h-72" />
                )}

                <div className="px-6 py-6 sm:px-8">
                  <p className="text-sm text-gray-500">
                    {getCategoryLabel(featuredPost.category)} • {formatDate(featuredPost.publishedAt)} • {featuredPost.author}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href={`/blog/${featuredPost.slug}`}>Read featured post</Link>
                    </Button>
                  </div>
                </div>
              </article>

              <div className="space-y-4">
                {otherPosts.slice(0, 3).map((post) => (
                  <article
                    key={post.id}
                    className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">
                      {getCategoryLabel(post.category)} • {formatDate(post.publishedAt)} • {post.author}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-gray-900">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 inline-flex text-sm font-semibold text-primary transition hover:text-primary/80"
                    >
                      Read article
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-8 rounded-[28px] border border-gray-200 bg-white px-6 py-10 text-sm text-gray-600 shadow-sm">
              No blog posts have been published yet.
            </section>
          )}

          {otherPosts.length > 3 ? (
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {otherPosts.slice(3).map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"
                >
                  {post.coverImageUrl ? (
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
                  )}

                  <div className="p-5">
                    <p className="text-sm text-gray-500">
                      {getCategoryLabel(post.category)} • {formatDate(post.publishedAt)} • {post.author}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-gray-900">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 inline-flex text-sm font-semibold text-primary transition hover:text-primary/80"
                    >
                      Read article
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
