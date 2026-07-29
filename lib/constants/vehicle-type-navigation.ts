import type { ListingCategory } from "@/lib/constants/marketplace";

export type VehicleTypeNavigationItem = {
  name: string;
  href: string;
  category: ListingCategory;
};

export const VEHICLE_TYPE_NAVIGATION_ITEMS = [
  { name: "Cars & Vans", href: "/search?category=car", category: "car" },
  { name: "Motorbikes", href: "/search?category=motorbike", category: "motorbike" },
  { name: "Trucks", href: "/search?category=truck", category: "truck" },
  { name: "Farm", href: "/search?category=farm_agricultural", category: "farm_agricultural" },
  { name: "Plant", href: "/search?category=plant_construction", category: "plant_construction" },
] as const satisfies ReadonlyArray<VehicleTypeNavigationItem>;
