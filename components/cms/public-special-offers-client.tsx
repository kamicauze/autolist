"use client";

import Link from "next/link";
import { ArrowUpRight, Tag } from "lucide-react";
import type { CmsSpecialOffer } from "@/lib/types/cms-special-offers";
import { cn } from "@/lib/utils";
import { trackCmsOfferRedemption } from "./cms-tracking";

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function SpecialOfferCard({ offer }: { offer: CmsSpecialOffer }) {
  const href = offer.targetUrl || "/";
  const external = isExternalHref(href);
  const content = (
    <div className="group h-full overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-[#f3f4f6]">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS campaign images can use arbitrary approved URLs. */}
        <img
          src={offer.imageUrl}
          alt={offer.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[#111827] shadow-sm backdrop-blur">
          <Tag className="h-3.5 w-3.5 text-primary" />
          {offer.audience}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-[19px] font-semibold leading-tight text-[#111827]">
          {offer.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[14px] leading-6 text-[#6b7280]">
          {offer.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
          View offer
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackCmsOfferRedemption(offer.id)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={() => trackCmsOfferRedemption(offer.id)}>
      {content}
    </Link>
  );
}

export function PublicSpecialOffersList({
  offers,
  className,
}: {
  offers: CmsSpecialOffer[];
  className?: string;
}) {
  if (offers.length === 0) return null;

  return (
    <section className={cn("py-10 md:py-12", className)} aria-label="Special offers">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
              Special Offers
            </p>
            <h2 className="mt-2 font-heading text-[28px] font-semibold text-[#111827]">
              Current deals from Autolist
            </h2>
          </div>
          <p className="max-w-xl text-[14px] leading-6 text-[#6b7280]">
            Limited-time campaigns, partner deals, and marketplace promotions.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <SpecialOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
