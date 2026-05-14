"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CmsBanner } from "@/lib/types/cms-banners";
import { cn } from "@/lib/utils";
import {
  trackCmsBannerClick,
  useCmsBannerImpressions,
} from "./cms-tracking";

type PublicCmsBannerVariant = "full" | "compact" | "sidebar" | "hero" | "gutter";

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function getBannerHref(banner: CmsBanner) {
  const explicitHref = banner.targetUrl?.trim();
  if (explicitHref) return explicitHref;
  if (banner.slug) return `/ads/${banner.slug}`;
  return "";
}

function PublicCmsBannerCard({
  banner,
  variant,
}: {
  banner: CmsBanner;
  variant: PublicCmsBannerVariant;
}) {
  const href = getBannerHref(banner);
  const hasHref = Boolean(href);
  const external = hasHref && isExternalHref(href);
  const ctaLabel = banner.ctaLabel?.trim() || "Learn more";
  const image = (
    <picture>
      {banner.mobileImageUrl ? <source srcSet={banner.mobileImageUrl} media="(max-width: 640px)" /> : null}
      <img
        src={banner.desktopImageUrl}
        alt={banner.altText || banner.title}
        className={cn(
          "h-full w-full object-cover transition duration-300",
          hasHref && "group-hover:scale-[1.02]"
        )}
      />
    </picture>
  );
  const body = (
    <div
      className={cn(
        "group relative overflow-hidden border border-[#e5e7eb] bg-white shadow-sm",
        variant === "hero" ? "rounded-none border-x-0 border-t-0" : "rounded-[18px]",
        variant === "full" && "min-h-[150px] sm:min-h-[180px]",
        variant === "compact" && "min-h-[120px]",
        variant === "sidebar" && "min-h-[260px]",
        variant === "gutter" && "min-h-[300px]",
        variant === "hero" && "min-h-[340px] sm:min-h-[420px]"
      )}
    >
      <div className="absolute inset-0">{image}</div>
      <div
        className={cn(
          "absolute inset-0",
          variant === "hero"
            ? "bg-gradient-to-r from-black/80 via-black/45 to-black/15"
            : "bg-gradient-to-r from-black/70 via-black/25 to-transparent"
        )}
      />
      <div
        className={cn(
          "relative flex h-full min-h-[inherit] flex-col justify-end p-5 text-white",
          (variant === "sidebar" || variant === "gutter") && "justify-between",
          variant === "hero" && "mx-auto w-full max-w-7xl justify-center px-4 py-10 sm:px-6 lg:px-8"
        )}
      >
        <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
          Sponsored
        </p>
        <div
          className={cn(
            variant === "sidebar" || variant === "gutter" ? "" : "mt-10",
            variant === "hero" ? "max-w-3xl" : "max-w-xl"
          )}
        >
          <h3
            className={cn(
              "font-heading font-semibold leading-tight",
              variant === "hero"
                ? "text-[34px] sm:text-[46px]"
                : variant === "full"
                  ? "text-[24px] sm:text-[30px]"
                  : variant === "gutter"
                    ? "text-[15px]"
                    : "text-[18px]"
            )}
          >
            {banner.title}
          </h3>
          {banner.summary ? (
            <p
              className={cn(
                "mt-3 max-w-2xl text-white/92",
                variant === "hero"
                  ? "text-[16px] leading-7"
                  : variant === "gutter"
                    ? "text-[12px] leading-5"
                    : "text-[13px] leading-6"
              )}
            >
              {banner.summary}
            </p>
          ) : null}
          {hasHref ? (
            <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (!hasHref) {
    return body;
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackCmsBannerClick(banner.id)}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} onClick={() => trackCmsBannerClick(banner.id)}>
      {body}
    </Link>
  );
}

export function PublicCmsBannerList({
  banners,
  variant,
  className,
}: {
  banners: CmsBanner[];
  variant: PublicCmsBannerVariant;
  className?: string;
}) {
  useCmsBannerImpressions(banners.map((banner) => banner.id));

  if (banners.length === 0) return null;

  return (
    <section
      aria-label="Promotional banners"
      className={cn(
        variant === "sidebar"
          ? "space-y-4"
          : variant === "gutter"
            ? "space-y-4"
          : "mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:px-8",
        variant === "full" && "py-6",
        variant === "compact" && "py-4",
        variant === "hero" && "max-w-none px-0 py-0",
        className
      )}
    >
      {banners.map((banner) => (
        <PublicCmsBannerCard key={banner.id} banner={banner} variant={variant} />
      ))}
    </section>
  );
}
