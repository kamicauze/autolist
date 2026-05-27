import type { ListingCategory } from "@/lib/constants/marketplace";
import { BODY_TYPES, YEARS } from "@/lib/constants/filters";
import {
  FARM_AGRICULTURAL_EQUIPMENT_TYPES,
  PLANT_CONSTRUCTION_EQUIPMENT_TYPES,
} from "@/lib/constants/non-car-reference-data";

export const LANDING_PRICE_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "500,000", value: "500000" },
  { label: "1,000,000", value: "1000000" },
  { label: "2,000,000", value: "2000000" },
  { label: "3,000,000", value: "3000000" },
  { label: "5,000,000", value: "5000000" },
  { label: "7,000,000", value: "7000000" },
  { label: "10,000,000", value: "10000000" },
  { label: "15,000,000", value: "15000000" },
  { label: "20,000,000", value: "20000000" },
] as const;

export const LANDING_YEAR_OPTIONS = [
  { label: "Any", value: "any" },
  ...YEARS.map((year) => ({ label: String(year), value: String(year) })),
];

const MOTORBIKE_TYPE_OPTIONS = [
  "Adventure",
  "Bobber",
  "Cafe Racer",
  "Chopper",
  "Classic",
  "Commuter",
  "Cruiser",
  "Dual-Sport",
  "Electric/E-bike",
  "Moped",
  "Motocrosser",
  "Naked",
  "Off-Road",
  "Quad",
  "Scooter",
  "Sport Bike",
  "Super Moto",
  "Touring",
  "Trail Bike",
].map((label) => ({ label, value: label }));

const MOTORBIKE_ENGINE_OPTIONS = [
  "50cc",
  "125cc",
  "200cc",
  "400cc",
  "600cc",
  "700cc",
  "800cc",
  "900cc",
  "1000cc",
  "1100cc",
  "1200cc",
].map((label) => ({ label, value: label }));

const VAN_TYPE_OPTIONS = [
  { label: "Panel Van", value: "panel_van" },
  { label: "Passenger Van", value: "passenger_van" },
  { label: "Pickup", value: "pickup" },
  { label: "Minibus", value: "minibus" },
];

const VAN_SEAT_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "2 seats", value: "2" },
  { label: "5 seats", value: "5" },
  { label: "7 seats", value: "7" },
  { label: "14 seats", value: "14" },
  { label: "33+ seats", value: "33" },
];

const TRUCK_TYPE_OPTIONS = [
  { label: "Rigid Trucks", value: "Rigid Trucks" },
  { label: "Tractor Units", value: "Tractor Units" },
];

const TRUCK_AXLE_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "4x2", value: "4x2" },
  { label: "4x4", value: "4x4" },
  { label: "6x2", value: "6x2" },
  { label: "6x4", value: "6x4" },
  { label: "6x6", value: "6x6" },
  { label: "8x2", value: "8x2" },
  { label: "8x4", value: "8x4" },
  { label: "8x6", value: "8x6" },
  { label: "8x8", value: "8x8" },
];

const PLANT_TYPE_OPTIONS = PLANT_CONSTRUCTION_EQUIPMENT_TYPES.map(({ label, value }) => ({ label, value }));
const FARM_TYPE_OPTIONS = FARM_AGRICULTURAL_EQUIPMENT_TYPES.map(({ label, value }) => ({ label, value }));

export type LandingSearchCategoryConfig = {
  label: string;
  brandLabel: string;
  modelLabel: string;
  resultLabelPlural: string;
  searchPageTitle: string;
  searchPageDescription: string;
  makeMode: "select" | "suggested" | "manual";
  modelMode: "select" | "manual";
  primaryField: {
    label: string;
    options: Array<{ label: string; value: string }>;
  };
  secondaryField: {
    label: string;
    options: Array<{ label: string; value: string }>;
  };
};

export const LANDING_SEARCH_CATEGORY_CONFIG: Record<ListingCategory, LandingSearchCategoryConfig> = {
  car: {
    label: "Cars & Vans",
    brandLabel: "Brand",
    modelLabel: "Model",
    resultLabelPlural: "cars and vans",
    searchPageTitle: "Cars & vans for sale",
    searchPageDescription: "Browse new and used cars, vans, pickups, and utility vehicles from dealers and private sellers.",
    makeMode: "select",
    modelMode: "select",
    primaryField: {
      label: "Body style",
      options: [{ label: "Any", value: "any" }, ...BODY_TYPES.map((item) => ({ label: item, value: item }))],
    },
    secondaryField: {
      label: "Year from",
      options: LANDING_YEAR_OPTIONS,
    },
  },
  van: {
    label: "Vans",
    brandLabel: "Make",
    modelLabel: "Model",
    resultLabelPlural: "vans",
    searchPageTitle: "Vans for sale",
    searchPageDescription: "Browse vans, pickups, minibuses and utility vehicles from the marketplace.",
    makeMode: "manual",
    modelMode: "manual",
    primaryField: {
      label: "Van type",
      options: [{ label: "Any", value: "any" }, ...VAN_TYPE_OPTIONS],
    },
    secondaryField: {
      label: "Seats",
      options: VAN_SEAT_OPTIONS,
    },
  },
  motorbike: {
    label: "Motorbikes",
    brandLabel: "Make",
    modelLabel: "Model / Series",
    resultLabelPlural: "bikes",
    searchPageTitle: "Motorbikes for sale",
    searchPageDescription: "Browse scooters, commuter bikes, adventure bikes and other motorbike listings.",
    makeMode: "suggested",
    modelMode: "manual",
    primaryField: {
      label: "Bike type",
      options: [{ label: "Any", value: "any" }, ...MOTORBIKE_TYPE_OPTIONS],
    },
    secondaryField: {
      label: "Engine size",
      options: [{ label: "Any", value: "any" }, ...MOTORBIKE_ENGINE_OPTIONS],
    },
  },
  truck: {
    label: "Trucks",
    brandLabel: "Make",
    modelLabel: "Model / Series",
    resultLabelPlural: "trucks",
    searchPageTitle: "Trucks for sale",
    searchPageDescription: "Browse rigid trucks, tractor units and heavy commercial listings.",
    makeMode: "suggested",
    modelMode: "manual",
    primaryField: {
      label: "Truck type",
      options: [{ label: "Any", value: "any" }, ...TRUCK_TYPE_OPTIONS],
    },
    secondaryField: {
      label: "Axle",
      options: TRUCK_AXLE_OPTIONS,
    },
  },
  plant_construction: {
    label: "Plant",
    brandLabel: "Manufacturer",
    modelLabel: "Model / Type",
    resultLabelPlural: "plant items",
    searchPageTitle: "Plant & construction equipment",
    searchPageDescription: "Browse excavators, loaders, forklifts and construction equipment listings.",
    makeMode: "suggested",
    modelMode: "manual",
    primaryField: {
      label: "Equipment type",
      options: [{ label: "Any", value: "any" }, ...PLANT_TYPE_OPTIONS],
    },
    secondaryField: {
      label: "Year from",
      options: LANDING_YEAR_OPTIONS,
    },
  },
  farm_agricultural: {
    label: "Farm",
    brandLabel: "Manufacturer",
    modelLabel: "Model / Type",
    resultLabelPlural: "farm items",
    searchPageTitle: "Farm & agricultural equipment",
    searchPageDescription: "Browse tractors, harvesters and agricultural equipment from the marketplace.",
    makeMode: "manual",
    modelMode: "manual",
    primaryField: {
      label: "Equipment type",
      options: [{ label: "Any", value: "any" }, ...FARM_TYPE_OPTIONS],
    },
    secondaryField: {
      label: "Year from",
      options: LANDING_YEAR_OPTIONS,
    },
  },
};

export const LANDING_SEARCH_CATEGORY_ORDER: ListingCategory[] = [
  "car",
  "motorbike",
  "truck",
  "plant_construction",
  "farm_agricultural",
];
