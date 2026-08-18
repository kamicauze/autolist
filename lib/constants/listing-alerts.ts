import { LANDING_SEARCH_CATEGORY_CONFIG } from "@/lib/constants/landing-search";
import { FUEL_TYPES } from "@/lib/constants/filters";
import type { ListingCategory } from "@/lib/constants/marketplace";
import { HOURS_USED_STEPS } from "@/lib/constants/vehicle-taxonomy";

type ListingAlertPreferenceField = {
  label: string;
  options: Array<{ label: string; value: string }>;
};

export type ListingAlertCategoryConfig = {
  brandLabel: string;
  modelLabel: string;
  fields: [ListingAlertPreferenceField, ListingAlertPreferenceField];
};

const fuelField: ListingAlertPreferenceField = {
  label: "Fuel type",
  options: [
    { label: "Any", value: "any" },
    ...FUEL_TYPES.map((fuelType) => ({ label: fuelType, value: fuelType })),
  ],
};

const usageHoursField: ListingAlertPreferenceField = {
  label: "Usage hours",
  options: [
    { label: "Any", value: "any" },
    ...HOURS_USED_STEPS.filter((hours) => hours > 0).map((hours) => ({
      label: `Under ${new Intl.NumberFormat("en-KE").format(hours)} hours`,
      value: String(hours),
    })),
  ],
};

function alertConfig(
  category: ListingCategory,
  fields: [ListingAlertPreferenceField, ListingAlertPreferenceField]
): ListingAlertCategoryConfig {
  const { brandLabel, modelLabel } = LANDING_SEARCH_CATEGORY_CONFIG[category];
  return { brandLabel, modelLabel, fields };
}

export const LISTING_ALERT_CATEGORY_CONFIG: Record<
  ListingCategory,
  ListingAlertCategoryConfig
> = {
  car: alertConfig("car", [LANDING_SEARCH_CATEGORY_CONFIG.car.primaryField, fuelField]),
  van: alertConfig("van", [
    LANDING_SEARCH_CATEGORY_CONFIG.van.primaryField,
    LANDING_SEARCH_CATEGORY_CONFIG.van.secondaryField,
  ]),
  motorbike: alertConfig("motorbike", [
    LANDING_SEARCH_CATEGORY_CONFIG.motorbike.primaryField,
    LANDING_SEARCH_CATEGORY_CONFIG.motorbike.secondaryField,
  ]),
  truck: alertConfig("truck", [
    LANDING_SEARCH_CATEGORY_CONFIG.truck.primaryField,
    LANDING_SEARCH_CATEGORY_CONFIG.truck.secondaryField,
  ]),
  plant_construction: alertConfig("plant_construction", [
    LANDING_SEARCH_CATEGORY_CONFIG.plant_construction.primaryField,
    usageHoursField,
  ]),
  farm_agricultural: alertConfig("farm_agricultural", [
    LANDING_SEARCH_CATEGORY_CONFIG.farm_agricultural.primaryField,
    usageHoursField,
  ]),
};
