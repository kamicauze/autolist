import { LANDING_SEARCH_CATEGORY_CONFIG } from "@/lib/constants/landing-search";
import { FUEL_TYPES } from "@/lib/constants/filters";
import type { ListingCategory } from "@/lib/constants/marketplace";
import { ENGINE_CC_OPTIONS } from "@/lib/constants/search-filter-config";
import {
  BIKE_BODY_TYPES,
  HOURS_USED_STEPS,
  TRUCK_CATEGORIES,
} from "@/lib/constants/vehicle-taxonomy";

export type ListingAlertCriterionKey =
  | "bodyType"
  | "fuelType"
  | "seats"
  | "engineCc"
  | "taxonomyCategory"
  | "axleConfig"
  | "equipmentType"
  | "hoursMax";

type ListingAlertPreferenceField = {
  key: ListingAlertCriterionKey;
  label: string;
  options: Array<{ label: string; value: string }>;
};

export type ListingAlertCategoryConfig = {
  brandLabel: string;
  modelLabel: string;
  fields: [ListingAlertPreferenceField, ListingAlertPreferenceField];
};

const fuelField: ListingAlertPreferenceField = {
  key: "fuelType",
  label: "Fuel type",
  options: [
    { label: "Any", value: "any" },
    ...FUEL_TYPES.map((fuelType) => ({ label: fuelType, value: fuelType })),
  ],
};

const usageHoursField: ListingAlertPreferenceField = {
  key: "hoursMax",
  label: "Usage hours",
  options: [
    { label: "Any", value: "any" },
    ...HOURS_USED_STEPS.filter((hours) => hours > 0).map((hours) => ({
      label: `Under ${new Intl.NumberFormat("en-KE").format(hours)} hours`,
      value: String(hours),
    })),
  ],
};

const withKey = (
  key: ListingAlertCriterionKey,
  field: Omit<ListingAlertPreferenceField, "key">
): ListingAlertPreferenceField => ({ key, ...field });

const motorbikeEngineField: ListingAlertPreferenceField = {
  key: "engineCc",
  label: "Engine size",
  options: [{ label: "Any", value: "any" }, ...ENGINE_CC_OPTIONS],
};

const motorbikeTypeField: ListingAlertPreferenceField = {
  key: "bodyType",
  label: "Bike type",
  options: [
    { label: "Any", value: "any" },
    ...BIKE_BODY_TYPES.map((value) => ({ label: value, value })),
  ],
};

const truckTypeField: ListingAlertPreferenceField = {
  key: "taxonomyCategory",
  label: "Truck type",
  options: [
    { label: "Any", value: "any" },
    ...TRUCK_CATEGORIES.map((value) => ({ label: value, value })),
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
  car: alertConfig("car", [
    withKey("bodyType", LANDING_SEARCH_CATEGORY_CONFIG.car.primaryField),
    fuelField,
  ]),
  van: alertConfig("van", [
    withKey("bodyType", LANDING_SEARCH_CATEGORY_CONFIG.van.primaryField),
    withKey("seats", LANDING_SEARCH_CATEGORY_CONFIG.van.secondaryField),
  ]),
  motorbike: alertConfig("motorbike", [
    motorbikeTypeField,
    motorbikeEngineField,
  ]),
  truck: alertConfig("truck", [
    truckTypeField,
    withKey("axleConfig", LANDING_SEARCH_CATEGORY_CONFIG.truck.secondaryField),
  ]),
  plant_construction: alertConfig("plant_construction", [
    withKey("equipmentType", LANDING_SEARCH_CATEGORY_CONFIG.plant_construction.primaryField),
    usageHoursField,
  ]),
  farm_agricultural: alertConfig("farm_agricultural", [
    withKey("equipmentType", LANDING_SEARCH_CATEGORY_CONFIG.farm_agricultural.primaryField),
    usageHoursField,
  ]),
};

export const LISTING_ALERT_PRICE_OPTIONS = [
  { label: "Any price", value: "any", min: null, max: null },
  { label: "Under KES 1M", value: "under-1m", min: null, max: 1_000_000 },
  { label: "KES 1M – 3M", value: "1m-3m", min: 1_000_000, max: 3_000_000 },
  { label: "Above KES 3M", value: "above-3m", min: 3_000_000, max: null },
] as const;

export type ListingAlertPriceRange = (typeof LISTING_ALERT_PRICE_OPTIONS)[number]["value"];
