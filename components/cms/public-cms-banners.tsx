import { getActiveCmsBanners } from "@/lib/data/cms-banners";
import type { CmsBannerPlacement } from "@/lib/types/cms-banners";
import { PublicCmsBannerList } from "./public-cms-banners-client";

type PublicCmsBannerVariant = "full" | "compact" | "sidebar";

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
