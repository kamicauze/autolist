/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RichContentRenderer } from "@/components/cms/rich-content-renderer";
import { getPublishedContentPostBySlug } from "@/lib/data/content-posts";
import { getContentPostSubcategoryLabel } from "@/lib/content-post-subcategories";
import type { ContentPostCategory } from "@/lib/types/content-posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
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

function getCategoryLabel(category: ContentPostCategory) {
  switch (category) {
    case "review":
      return "Review";
    case "news":
      return "News";
    case "advice":
      return "Advice";
    case "faq":
      return "FAQ";
    default:
      return "Blog";
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedContentPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
            className="mb-4"
          />

          <article className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-60 w-full object-cover sm:h-80"
              />
            ) : (
              <div className="h-60 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 sm:h-80" />
            )}

            <div className="px-6 py-8 sm:px-10">
              <p className="text-sm text-gray-500">
                {getContentPostSubcategoryLabel(post.subcategory) ?? getCategoryLabel(post.category)} • {formatDate(post.publishedAt)} • {post.author}
              </p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">{post.excerpt}</p>

              <RichContentRenderer body={post.body} className="mt-8 text-[16px] text-gray-700" />

              {post.galleryImageUrls.length > 0 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {post.galleryImageUrls.map((imageUrl, index) => (
                    <img
                      key={`${post.id}-gallery-${index}`}
                      src={imageUrl}
                      alt={`${post.title} photo ${index + 1}`}
                      className="h-48 w-full rounded-[18px] object-cover sm:h-56"
                    />
                  ))}
                </div>
              ) : null}

              <div className="mt-8 border-t border-gray-200 pt-6">
                <Link
                  href="/blog"
                  className="inline-flex text-sm font-semibold text-primary transition hover:text-primary/80"
                >
                  Back to blog
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
