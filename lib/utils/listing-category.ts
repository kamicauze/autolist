import type { ListingCategory } from "@/lib/constants/marketplace";
import {
  FARM_CATEGORY_TAXONOMY,
  getFarmCategoryLabel,
  getFarmSubcategoryLabel,
  toFarmTaxonomyValue,
} from "@/lib/constants/farm-taxonomy";

export type ListingCardSpecKind =
  | "mileage"
  | "fuel"
  | "transmission"
  | "engine_capacity"
  | "axle"
  | "load_capacity"
  | "operating_hours"
  | "weight"
  | "status"
  | "power";

export type ListingCardSpec = {
  kind: ListingCardSpecKind;
  label: string;
  value: string;
};

type CategoryFilterConfig = {
  bodyTypeLabel: string;
  bodyTypes: ReadonlyArray<{ value: string; label: string }>;
  bodyTypeGroups?: ReadonlyArray<{
    label: string;
    options: ReadonlyArray<{ value: string; label: string }>;
  }>;
  resultLabel: string;
  showMileage: boolean;
  showTransmission: boolean;
  showFuel: boolean;
  showColor: boolean;
  showSeats: boolean;
  showDoors: boolean;
  showDriveType: boolean;
};

const CATEGORY_FILTER_CONFIG: Record<ListingCategory, CategoryFilterConfig> = {
  car: {
    bodyTypeLabel: "Body Type",
    bodyTypes: [
      { value: "sedan", label: "Sedan" },
      { value: "suv", label: "SUV" },
      { value: "hatchback", label: "Hatchback" },
      { value: "wagon", label: "Wagon" },
      { value: "coupe", label: "Coupe" },
    ],
    resultLabel: "cars",
    showMileage: true,
    showTransmission: true,
    showFuel: true,
    showColor: true,
    showSeats: true,
    showDoors: true,
    showDriveType: true,
  },
  van: {
    bodyTypeLabel: "Body Style",
    bodyTypes: [
      { value: "panel_van", label: "Panel Van" },
      { value: "pickup", label: "Pickup" },
      { value: "minibus", label: "Minibus" },
      { value: "passenger_van", label: "Passenger Van" },
    ],
    resultLabel: "vans",
    showMileage: true,
    showTransmission: true,
    showFuel: true,
    showColor: true,
    showSeats: true,
    showDoors: false,
    showDriveType: false,
  },
  motorbike: {
    bodyTypeLabel: "Bike Type",
    bodyTypes: [
      { value: "sport", label: "Sport" },
      { value: "street", label: "Street" },
      { value: "cruiser", label: "Cruiser" },
      { value: "touring", label: "Touring" },
      { value: "scooter", label: "Scooter" },
      { value: "off_road", label: "Off-road" },
      { value: "dirt", label: "Dirt" },
      { value: "standard", label: "Standard / Naked" },
    ],
    resultLabel: "motorbikes",
    showMileage: true,
    showTransmission: false,
    showFuel: false,
    showColor: true,
    showSeats: false,
    showDoors: false,
    showDriveType: false,
  },
  truck: {
    bodyTypeLabel: "Truck Type",
    bodyTypes: [
      { value: "box", label: "Box" },
      { value: "flatbed", label: "Flatbed" },
      { value: "tipper", label: "Tipper" },
      { value: "tractor_head", label: "Tractor Head" },
    ],
    resultLabel: "trucks",
    showMileage: true,
    showTransmission: true,
    showFuel: true,
    showColor: false,
    showSeats: false,
    showDoors: false,
    showDriveType: false,
  },
  plant_construction: {
    bodyTypeLabel: "Equipment Type",
    bodyTypes: [
      { value: "excavator", label: "Excavator" },
      { value: "bulldozer", label: "Bulldozer" },
      { value: "crane", label: "Crane" },
      { value: "loader", label: "Loader" },
    ],
    resultLabel: "plant listings",
    showMileage: false,
    showTransmission: false,
    showFuel: false,
    showColor: false,
    showSeats: false,
    showDoors: false,
    showDriveType: false,
  },
  farm_agricultural: {
    bodyTypeLabel: "Equipment Type",
    bodyTypes: FARM_CATEGORY_TAXONOMY.flatMap((category) =>
      category.subcategories.map((label) => ({
        value: toFarmTaxonomyValue(label),
        label,
      }))
    ),
    bodyTypeGroups: FARM_CATEGORY_TAXONOMY.map((category) => ({
      label: category.label,
      options: category.subcategories.map((label) => ({
        value: toFarmTaxonomyValue(label),
        label,
      })),
    })),
    resultLabel: "farm listings",
    showMileage: false,
    showTransmission: false,
    showFuel: false,
    showColor: false,
    showSeats: false,
    showDoors: false,
    showDriveType: false,
  },
};

export function getCategoryFilterConfig(
  category: ListingCategory | undefined
): CategoryFilterConfig {
  return CATEGORY_FILTER_CONFIG[category ?? "car"];
}

const LISTING_CATEGORY_BY_TYPE: Record<string, ListingCategory> = {
  car: "car",
  cars: "car",
  van: "van",
  vans: "van",
  bike: "motorbike",
  bikes: "motorbike",
  motorbike: "motorbike",
  motorbikes: "motorbike",
  electric_bike: "motorbike",
  electric_bikes: "motorbike",
  truck: "truck",
  trucks: "truck",
  farm: "farm_agricultural",
  farm_agricultural: "farm_agricultural",
  plant: "plant_construction",
  plant_machinery: "plant_construction",
  plant_construction: "plant_construction",
};

function normalizeListingType(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function resolveListingCategory(
  value: string | string[] | undefined
): ListingCategory | undefined {
  const type = Array.isArray(value) ? value[0] : value;
  if (!type) return undefined;

  return LISTING_CATEGORY_BY_TYPE[normalizeListingType(type)];
}

export function getListingBodyType(
  details: Partial<Record<"bodyType" | "bodyStyle" | "bikeType" | "equipmentType", string>>
): string | undefined {
  return (
    details.bodyType ||
    details.bodyStyle ||
    details.bikeType ||
    details.equipmentType ||
    undefined
  );
}

export function getListingDisplayType({
  category,
  bodyType,
  metadata,
}: {
  category?: ListingCategory;
  bodyType: string;
  metadata?: Record<string, unknown> | null;
}): string {
  if (category !== "farm_agricultural") return humanize(bodyType);

  const details = getMetadataDetails(metadata);
  const farmCategory = getFarmCategoryLabel(details.farmCategory);
  const subcategory = getFarmSubcategoryLabel(
    details.farmCategory,
    details.equipmentType || bodyType
  );

  return [farmCategory, subcategory || humanize(bodyType)].filter(Boolean).join(" · ");
}

export function getPersistedListingDetails(
  details: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(details).filter(([, value]) => value.trim().length > 0)
  );
}

function humanize(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getMetadataDetails(
  metadata: Record<string, unknown> | null | undefined
): Record<string, string> {
  const details = metadata?.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return {};

  return Object.fromEntries(
    Object.entries(details).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0
    )
  );
}

function compactSpecs(
  ...specs: Array<ListingCardSpec | false | "" | undefined>
): ListingCardSpec[] {
  return specs.filter((spec): spec is ListingCardSpec => Boolean(spec));
}

export function getListingCardSpecs({
  category = "car",
  metadata,
  mileage,
  fuelType,
  transmission,
}: {
  category?: ListingCategory;
  metadata?: Record<string, unknown> | null;
  mileage: string;
  fuelType: string;
  transmission: string;
}): ListingCardSpec[] {
  const details = getMetadataDetails(metadata);

  switch (category) {
    case "motorbike":
      return compactSpecs(
        details.fuelSystem && {
          kind: "fuel",
          label: "Fuel system",
          value: humanize(details.fuelSystem),
        },
        details.engineCapacity && {
          kind: "engine_capacity",
          label: "Engine capacity",
          value: `${details.engineCapacity} cc`,
        },
        mileage !== "N/A" && { kind: "mileage", label: "Mileage", value: mileage }
      );

    case "truck":
      return compactSpecs(
        fuelType !== "N/A" && { kind: "fuel", label: "Fuel type", value: fuelType },
        details.axleConfiguration && {
          kind: "axle",
          label: "Axle configuration",
          value: details.axleConfiguration,
        },
        details.loadCapacity
          ? {
              kind: "load_capacity",
              label: "Load capacity",
              value: `${details.loadCapacity} tonnes`,
            }
          : mileage !== "N/A" && { kind: "mileage", label: "Mileage", value: mileage }
      );

    case "plant_construction":
      return compactSpecs(
        details.operatingHours && {
          kind: "operating_hours",
          label: "Operating hours",
          value: `${details.operatingHours} hrs`,
        },
        details.operatingWeight && {
          kind: "weight",
          label: "Operating weight",
          value: `${details.operatingWeight} kg`,
        },
        details.operationalStatus && {
          kind: "status",
          label: "Operational status",
          value: humanize(details.operationalStatus),
        }
      );

    case "farm_agricultural":
      return compactSpecs(
        details.operatingHours && {
          kind: "operating_hours",
          label: "Operating hours",
          value: `${details.operatingHours} hrs`,
        },
        details.powerOutput && {
          kind: "power",
          label: "Power output",
          value: `${details.powerOutput} hp`,
        },
        details.operationalStatus && {
          kind: "status",
          label: "Operational status",
          value: humanize(details.operationalStatus),
        }
      );

    case "car":
    case "van":
      return compactSpecs(
        mileage !== "N/A" && { kind: "mileage", label: "Mileage", value: mileage },
        fuelType !== "N/A" && { kind: "fuel", label: "Fuel type", value: fuelType },
        transmission !== "N/A" && {
          kind: "transmission",
          label: "Transmission",
          value: transmission,
        }
      );
  }
}
