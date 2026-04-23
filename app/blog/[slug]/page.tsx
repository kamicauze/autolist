/* eslint-disable @next/next/no-img-element */

import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getPublishedContentPostBySlug } from "@/lib/data/content-posts";

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

function getBodyParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedContentPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = getBodyParagraphs(post.body);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 lg:px-8">
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
                className="h-72 w-full object-cover sm:h-96"
              />
            ) : (
              <div className="h-72 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 sm:h-96" />
            )}

            <div className="px-6 py-8 sm:px-10">
              <p className="text-sm text-gray-500">
                {formatDate(post.publishedAt)} • {post.author}
              </p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">{post.excerpt}</p>

              <div className="mt-8 space-y-5 text-[16px] leading-8 text-gray-700">
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${post.id}-${paragraphIndex}`}>
                    {paragraph.split("\n").map((line, lineIndex, lines) => (
                      <Fragment key={`${post.id}-${paragraphIndex}-${lineIndex}`}>
                        {line}
                        {lineIndex < lines.length - 1 ? <br /> : null}
                      </Fragment>
                    ))}
                  </p>
                ))}
              </div>

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
