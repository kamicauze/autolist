import type { ListingOverviewAssetKey } from "@/lib/utils/listing-overview";

export const LISTING_OVERVIEW_ASSET_PATHS = {
  mileage: "/assets/vehicle-specs/mileage.png",
  year: "/assets/vehicle-specs/year.png",
  condition: "/assets/vehicle-specs/condition.png",
  registration: "/assets/vehicle-specs/registration.png",
  fuel: "/assets/vehicle-specs/fuel.png",
  "engine-size": "/assets/vehicle-specs/engine-size.png",
  transmission: "/assets/vehicle-specs/transmission.png",
  "drive-type": "/assets/vehicle-specs/drive-type.png",
  "body-type": "/assets/vehicle-specs/body-type.png",
  category: "/assets/vehicle-specs/category.png",
  subcategory: "/assets/vehicle-specs/subcategory.png",
  trim: "/assets/vehicle-specs/trim.png",
  "model-variant": "/assets/vehicle-specs/model-variant.png",
  colors: "/assets/vehicle-specs/colors.png",
  doors: "/assets/vehicle-specs/doors.png",
  seats: "/assets/vehicle-specs/seats.png",
  location: "/assets/vehicle-specs/location.png",
} satisfies Record<ListingOverviewAssetKey, string>;
