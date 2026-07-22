import { notFound } from "next/navigation";
import { RichContentRenderer } from "@/components/cms/rich-content-renderer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  formatContentPageDate,
  getPublishedContentPageBySlug,
} from "@/lib/data/content-pages";
import type { ContentPageSlug } from "@/lib/types/content-pages";

type ManagedContentPageProps = {
  slug: ContentPageSlug;
  eyebrow?: string;
};

export async function ManagedContentPage({
  slug,
  eyebrow = "Autolist",
}: ManagedContentPageProps) {
  const page = await getPublishedContentPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-[#f8fafc]">
        <section className="border-b border-[#e5e7eb] bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-[40px] font-semibold leading-[1.1] text-[#111827]">
              {page.title}
            </h1>
            {page.summary ? (
              <p className="mt-4 max-w-3xl text-[16px] leading-7 text-[#475467]">
                {page.summary}
              </p>
            ) : null}
            {page.publishedAt ? (
              <p className="mt-6 text-[13px] text-[#94a3b8]">
                Effective {formatContentPageDate(page.publishedAt)}
              </p>
            ) : null}
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-10">
              <RichContentRenderer body={page.body} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
