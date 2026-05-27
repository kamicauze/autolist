/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  PublicCmsAdGrid,
  PublicCmsBannerPlacement,
} from "@/components/cms/public-cms-banners";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getActiveCmsBannerBySlug } from "@/lib/data/cms-banners";

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

type AdDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdDetailPage({ params }: AdDetailPageProps) {
  const { slug } = await params;
  const banner = await getActiveCmsBannerBySlug(slug);

  if (!banner) {
    notFound();
  }

  const hasTargetUrl = Boolean(banner.targetUrl);
  const ctaLabel = banner.ctaLabel?.trim() || (hasTargetUrl ? "Visit sponsor" : "Explore offer");
  const ctaHref = banner.targetUrl?.trim() || null;
  const ctaExternal = ctaHref ? isExternalHref(ctaHref) : false;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />

      <main className="pb-12">
        <PublicCmsBannerPlacement placement="ad_detail_hero" variant="hero" className="pb-0" />

        <PublicCmsAdGrid
          placement="ad_detail_sidebar"
          contentClassName="w-full max-w-4xl justify-self-center py-8"
        >
          <article className="overflow-hidden rounded-[24px] border border-[#e5e7eb] bg-white shadow-sm">
            <div className="relative aspect-[16/8] w-full overflow-hidden bg-[#0f172a]">
              <img
                src={banner.desktopImageUrl}
                alt={banner.altText || banner.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                  Sponsored
                </p>
                <h1 className="mt-4 max-w-3xl font-heading text-[30px] font-semibold leading-tight text-white sm:text-[42px]">
                  {banner.title}
                </h1>
                {banner.summary ? (
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/92">
                    {banner.summary}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
              {banner.body ? (
                <div className="space-y-4 text-[15px] leading-7 text-[#475467]">
                  {banner.body
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={`${banner.id}-paragraph-${index}`}>{paragraph}</p>
                    ))}
                </div>
              ) : (
                <p className="text-[15px] leading-7 text-[#475467]">
                  This campaign is managed from the CMS banner library. Add summary and body copy in
                  the admin editor to turn the placement into a full sponsor landing page.
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {ctaHref ? (
                  ctaExternal ? (
                    <a
                      href={ctaHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
                    >
                      {ctaLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={ctaHref}
                      className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
                    >
                      {ctaLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )
                ) : null}

                <Link
                  href="/insurance"
                  className="inline-flex h-11 items-center rounded-[12px] border border-[#d0d5dd] px-5 text-[14px] font-semibold text-[#111827] transition hover:border-[#2563eb] hover:text-[#2563eb]"
                >
                  Car insurance
                </Link>
              </div>
            </div>
          </article>
        </PublicCmsAdGrid>
      </main>

      <Footer />
    </div>
  );
}
