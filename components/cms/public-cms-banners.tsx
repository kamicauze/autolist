import { getActiveCmsBanners } from "@/lib/data/cms-banners";
import type { CmsBannerPlacement } from "@/lib/types/cms-banners";
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

export async function PublicCmsGutterBannerPlacement({
  placement,
  limit = 2,
}: Omit<PublicCmsBannerPlacementProps, "variant" | "className">) {
  const banners = await getActiveCmsBanners(placement, limit);

  if (banners.length === 0) return null;

  const [rightBanner, leftBanner] = banners;
  const gutterPosition = "top-8 bottom-0 hidden w-[160px] min-[1660px]:block";
  const gutterOffset = "max(1rem,calc((100vw-80rem)/2-180px))";

  return (
    <>
      {leftBanner ? (
        <aside
          className={`pointer-events-none absolute ${gutterPosition}`}
          style={{ left: gutterOffset }}
          aria-label="Left promotional banners"
        >
          <div className="pointer-events-auto sticky top-24">
            <PublicCmsBannerList banners={[leftBanner]} variant="gutter" />
          </div>
        </aside>
      ) : null}
      {rightBanner ? (
        <aside
          className={`pointer-events-none absolute ${gutterPosition}`}
          style={{ right: gutterOffset }}
          aria-label="Right promotional banners"
        >
          <div className="pointer-events-auto sticky top-24">
            <PublicCmsBannerList banners={[rightBanner]} variant="gutter" />
          </div>
        </aside>
      ) : null}
    </>
  );
}
