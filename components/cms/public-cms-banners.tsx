import type { ReactNode } from "react";
import { getActiveCmsBanners } from "@/lib/data/cms-banners";
import type { CmsBannerPlacement } from "@/lib/types/cms-banners";
import { cn } from "@/lib/utils";
import { PublicCmsBannerList } from "./public-cms-banners-client";

type PublicCmsBannerVariant = "full" | "compact" | "sidebar" | "hero" | "gutter";

type PublicCmsBannerPlacementProps = {
  placement: CmsBannerPlacement;
  limit?: number;
  variant?: PublicCmsBannerVariant;
  className?: string;
};

export async function PublicCmsBannerPlacement({
  placement,
  limit = 1,
  variant = "full",
  className,
}: PublicCmsBannerPlacementProps) {
  const banners = await getActiveCmsBanners(placement, limit);

  if (banners.length === 0) return null;

  return <PublicCmsBannerList banners={banners} variant={variant} className={className} />;
}

type PublicCmsAdGridProps = {
  placement: CmsBannerPlacement;
  children: ReactNode;
  limit?: number;
  className?: string;
  contentClassName?: string;
};

function CmsGutterColumn({
  banners,
  side,
}: {
  banners: Awaited<ReturnType<typeof getActiveCmsBanners>>;
  side: "left" | "right";
}) {
  if (banners.length === 0) return <div className="hidden lg:block" aria-hidden="true" />;

  return (
    <aside className="hidden lg:block" aria-label={`${side} promotional banners`}>
      <div className="sticky top-24">
        <PublicCmsBannerList banners={banners} variant="gutter" />
      </div>
    </aside>
  );
}

export async function PublicCmsAdGrid({
  placement,
  children,
  limit = 4,
  className,
  contentClassName,
}: PublicCmsAdGridProps) {
  const banners = await getActiveCmsBanners(placement, limit);
  const leftBanners = banners.filter((_, index) => index % 2 === 0);
  const rightBanners = banners.filter((_, index) => index % 2 === 1);
  const hasGutterBanners = banners.length > 0;

  if (!hasGutterBanners) {
    return (
      <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
        <div className={cn("min-w-0", contentClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[112px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[112px_minmax(0,1fr)_112px] 2xl:max-w-[1680px] 2xl:grid-cols-[144px_minmax(0,1280px)_144px]",
        className
      )}
    >
      <CmsGutterColumn banners={leftBanners} side="left" />
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
      <div className="hidden xl:block">
        <CmsGutterColumn banners={rightBanners} side="right" />
      </div>
    </div>
  );
}
