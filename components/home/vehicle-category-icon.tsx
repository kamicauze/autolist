import Image from "next/image";

import type { ListingCategory } from "@/lib/constants/marketplace";

const CATEGORY_IMAGES: Record<ListingCategory, string> = {
  car: "/category-images/car.webp",
  motorbike: "/category-images/motorbike.webp",
  van: "/category-images/van.webp",
  truck: "/category-images/truck.webp",
  plant_construction: "/category-images/plant.webp",
  farm_agricultural: "/category-images/farm.webp",
};

type VehicleCategoryIconProps = {
  category: ListingCategory;
  className?: string;
};

export function VehicleCategoryIcon({
  category,
  className,
}: VehicleCategoryIconProps) {
  return (
    <Image
      src={CATEGORY_IMAGES[category]}
      alt=""
      width={48}
      height={32}
      aria-hidden="true"
      className={className}
    />
  );
}
