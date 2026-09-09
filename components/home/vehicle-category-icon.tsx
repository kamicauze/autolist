import type { SVGProps } from "react";

import type { ListingCategory } from "@/lib/constants/marketplace";

type VehicleCategoryIconProps = SVGProps<SVGSVGElement> & {
  category: ListingCategory;
};

function CategoryDrawing({ category }: { category: ListingCategory }) {
  switch (category) {
    case "motorbike":
      return (
        <>
          <circle cx="11" cy="26" r="6" fill="currentColor" opacity="0.12" />
          <circle cx="37" cy="26" r="6" fill="currentColor" opacity="0.12" />
          <circle cx="11" cy="26" r="5" />
          <circle cx="37" cy="26" r="5" />
          <path d="m11 26 8-10 7 10H11Zm8-10h9l9 10m-11 0 5-15h5m-18 5-4-4h6" />
          <path d="M27 12h7" />
        </>
      );
    case "van":
      return (
        <>
          <path d="M5 12.5A4.5 4.5 0 0 1 9.5 8H32l9 9v10H5V12.5Z" fill="currentColor" opacity="0.12" />
          <path d="M5 12.5A4.5 4.5 0 0 1 9.5 8H32l9 9v10H5V12.5Z" />
          <path d="M31 8v10h10M10 13h15M10 18h15" />
          <circle cx="14" cy="28" r="4" fill="white" />
          <circle cx="34" cy="28" r="4" fill="white" />
          <circle cx="14" cy="28" r="3" />
          <circle cx="34" cy="28" r="3" />
        </>
      );
    case "truck":
      return (
        <>
          <rect x="4" y="7" width="25" height="20" rx="3" fill="currentColor" opacity="0.12" />
          <path d="M4 10a3 3 0 0 1 3-3h22v20H4V10Zm25 6h8l6 7v4H29V16Z" />
          <path d="M35 17v6h7M9 12h15" />
          <circle cx="13" cy="28" r="4" fill="white" />
          <circle cx="36" cy="28" r="4" fill="white" />
          <circle cx="13" cy="28" r="3" />
          <circle cx="36" cy="28" r="3" />
        </>
      );
    case "plant_construction":
      return (
        <>
          <rect x="4" y="27" width="29" height="6" rx="3" fill="currentColor" opacity="0.14" />
          <rect x="4" y="27" width="29" height="6" rx="3" />
          <circle cx="11" cy="30" r="1.5" />
          <circle cx="18.5" cy="30" r="1.5" />
          <circle cx="26" cy="30" r="1.5" />
          <path d="M12 27v-7h18v7M17 20V9h10l5 11" />
          <path d="M21 10v7h9M30 12l9 4 4 8" />
          <path d="m43 24-7 1.5 2.5 5.5H45" fill="currentColor" opacity="0.12" />
          <path d="m43 24-7 1.5 2.5 5.5H45" />
        </>
      );
    case "farm_agricultural":
      return (
        <>
          <circle cx="34" cy="26" r="8" fill="currentColor" opacity="0.12" />
          <circle cx="12" cy="28" r="5" fill="currentColor" opacity="0.12" />
          <circle cx="34" cy="26" r="7" />
          <circle cx="12" cy="28" r="4" />
          <path d="M8 24h16l4-8h10v4M19 24V10h10l4 6M19 15h14M6 20h13" />
          <path d="M23 10V6h5" />
        </>
      );
    case "car":
    default:
      return (
        <>
          <path d="m7 21 3.5-8A5 5 0 0 1 15 10h18a5 5 0 0 1 4.5 3l3.5 8v8H7v-8Z" fill="currentColor" opacity="0.12" />
          <path d="m7 21 3.5-8A5 5 0 0 1 15 10h18a5 5 0 0 1 4.5 3l3.5 8v8H7v-8Z" />
          <path d="M11 20h26l-3-7H14l-3 7Zm-4 1h34M12 25h5m14 0h5" />
          <circle cx="14" cy="29" r="3" fill="white" />
          <circle cx="34" cy="29" r="3" fill="white" />
          <circle cx="14" cy="29" r="2" />
          <circle cx="34" cy="29" r="2" />
        </>
      );
  }
}

export function VehicleCategoryIcon({
  category,
  className,
  ...props
}: VehicleCategoryIconProps) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <CategoryDrawing category={category} />
    </svg>
  );
}
