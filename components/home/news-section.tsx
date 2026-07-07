/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPublishedContentPosts } from "@/lib/data/content-posts";
import type { ContentPostCategory } from "@/lib/types/content-posts";

const CATEGORY_LABELS: Record<ContentPostCategory, string> = {
  blog: "Blog",
  review: "Reviews",
  news: "News",
  advice: "Advice",
  faq: "FAQ",
};

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function NewsSection() {
  const posts = await getPublishedContentPosts(4);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1285px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Car News & Advice
          </h2>
          <Link
            href="/blog"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex snap-x snap-mandatory gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-[320px] lg:w-[360px]"
              >
                <div className="relative h-48 overflow-hidden">
                  {post.coverImageUrl ? (
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
                  )}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                      {CATEGORY_LABELS[post.category] ?? "Blog"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
                  <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
