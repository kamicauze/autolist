import Image from "next/image";
import type { LucideIcon } from "lucide-react";

import { ICON_3D_ASSET_PATHS, type Icon3DAssetKey } from "@/lib/constants/icon-3d-assets";
import { cn } from "@/lib/utils";

export type Icon3DSize = "xs" | "sm" | "md" | "lg" | "xl";
export type Icon3DTone = "primary" | "success" | "warning" | "danger" | "neutral";

const BADGE_SIZE_CLASSES: Record<Icon3DSize, string> = {
  xs: "h-6 w-6 rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5",
  sm: "h-8 w-8 rounded-lg [&>svg]:h-4 [&>svg]:w-4",
  md: "h-10 w-10 rounded-xl [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6",
  xl: "h-16 w-16 rounded-[20px] [&>svg]:h-8 [&>svg]:w-8",
};

const GLYPH_SIZE_CLASSES: Record<Icon3DSize, string> = {
  xs: "h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5",
  sm: "h-4 w-4 [&>svg]:h-4 [&>svg]:w-4",
  md: "h-5 w-5 [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-6 w-6 [&>svg]:h-6 [&>svg]:w-6",
  xl: "h-8 w-8 [&>svg]:h-8 [&>svg]:w-8",
};

const ILLUSTRATION_SIZE_CLASSES: Record<Icon3DSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const ILLUSTRATION_PIXELS: Record<Icon3DSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

type Icon3DProps = {
  icon: LucideIcon;
  size?: Icon3DSize;
  tone?: Icon3DTone;
  variant?: "solid" | "soft" | "glyph";
  className?: string;
  label?: string;
};

// CSS-only 3D treatment for small, decorative icons (styles in globals.css).
// "solid"/"soft" wrap the glyph in a glossy badge; "glyph" shades the bare icon
// for tight inline spots where a badge would change the layout.
export function Icon3D({
  icon: Icon,
  size = "sm",
  tone = "primary",
  variant = "soft",
  className,
  label,
}: Icon3DProps) {
  return (
    <span
      className={cn(
        "icon-3d",
        variant === "glyph" ? GLYPH_SIZE_CLASSES[size] : BADGE_SIZE_CLASSES[size],
        className
      )}
      data-variant={variant}
      data-tone={tone === "primary" ? undefined : tone}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon strokeWidth={2.25} />
    </span>
  );
}

type Illustration3DProps = {
  asset: Icon3DAssetKey;
  fallbackIcon: LucideIcon;
  size?: Icon3DSize;
  tone?: Icon3DTone;
  className?: string;
  label?: string;
};

// Generated 3D illustration for large, meaningful icons. Falls back to the
// solid CSS badge until the asset has been generated.
export function Illustration3D({
  asset,
  fallbackIcon,
  size = "lg",
  tone,
  className,
  label,
}: Illustration3DProps) {
  const src = ICON_3D_ASSET_PATHS[asset];

  if (!src) {
    return (
      <Icon3D
        icon={fallbackIcon}
        size={size}
        tone={tone}
        variant="solid"
        className={cn(ILLUSTRATION_SIZE_CLASSES[size], className)}
        label={label}
      />
    );
  }

  return (
    <span
      className={cn("relative inline-flex shrink-0", ILLUSTRATION_SIZE_CLASSES[size], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${ILLUSTRATION_PIXELS[size]}px`}
        className="object-contain"
      />
    </span>
  );
}
