import type { Listing } from "@/lib/types/listing";
import {
  getListingBodyTypeLabel,
  getListingEngineDisplacement,
  getListingFuelTypeLabel,
  getListingMileageLabel,
  getListingTransmissionLabel,
  getListingTrim,
  getListingVariant,
} from "@/lib/utils/vehicle-display";
import {
  formatListingCondition,
  formatListingLabel,
  formatListingRegistrationStatus,
  getListingMetadataString,
} from "@/lib/utils/listing-details";

export interface ListingOverviewItem {
  key: ListingOverviewAssetKey;
  label: string;
  value: string;
}

export type ListingOverviewAssetKey =
  | "mileage"
  | "year"
  | "condition"
  | "registration"
  | "fuel"
  | "engine-size"
  | "transmission"
  | "drive-type"
  | "body-type"
  | "category"
  | "subcategory"
  | "trim"
  | "model-variant"
  | "colors"
  | "doors"
  | "seats"
  | "location";

function registrationStatus(listing: Listing) {
  const value = getListingMetadataString(listing, "registrationStatus");
  const label = formatListingRegistrationStatus(value);
  return label === "N/A" ? "" : label;
}

function conditionLabel(listing: Listing) {
  const label = formatListingCondition(listing.condition);
  return label === "N/A" ? "" : label;
}

function driveTypeLabel(listing: Listing) {
  const value =
    listing.drive_type ||
    getListingMetadataString(listing, "driveType") ||
    getListingMetadataString(listing, "drive_type") ||
    "";
  const normalized = value.trim().toLowerCase();

  if (["fwd", "rwd", "awd", "4wd"].includes(normalized)) {
    return normalized.toUpperCase();
  }

  return formatListingLabel(value);
}

function usesEquipmentTaxonomy(listing: Listing) {
  const category = (
    getListingMetadataString(listing, "category") ||
    getListingMetadataString(listing, "vehicleType") ||
    ""
  ).toLowerCase();

  return category === "farm_agricultural" || category === "plant_construction";
}

export function buildListingOverviewItems(
  listing: Listing,
  location?: string
): ListingOverviewItem[] {
  const equipmentTaxonomy = usesEquipmentTaxonomy(listing);

  const items: ListingOverviewItem[] = [
    {
      key: "mileage",
      label: "Mileage",
      value: getListingMileageLabel(listing),
    },
    {
      key: "year",
      label: "Year",
      value: String(listing.year),
    },
    {
      key: "condition",
      label: "Condition",
      value: conditionLabel(listing),
    },
    {
      key: "registration",
      label: "Registration",
      value: registrationStatus(listing),
    },
    {
      key: "fuel",
      label: "Fuel Type",
      value: getListingFuelTypeLabel(listing),
    },
    {
      key: "engine-size",
      label: "CC",
      value: getListingEngineDisplacement(listing) || "",
    },
    {
      key: "transmission",
      label: "Transmission",
      value: getListingTransmissionLabel(listing),
    },
    {
      key: "drive-type",
      label: "Drive type",
      value: driveTypeLabel(listing),
    },
    {
      key: equipmentTaxonomy ? "category" : "body-type",
      label: equipmentTaxonomy ? "Category" : "Body Type",
      value: equipmentTaxonomy
        ? getListingMetadataString(listing, "taxonomyCategory") || ""
        : getListingBodyTypeLabel(listing, ""),
    },
    {
      key: "subcategory",
      label: "Subcategory",
      value: equipmentTaxonomy
        ? getListingMetadataString(listing, "subcategory") ||
          getListingMetadataString(listing, "subCategory") ||
          ""
        : "",
    },
    {
      key: "trim",
      label: "Trim",
      value: getListingTrim(listing) || "",
    },
    {
      key: "model-variant",
      label: "Model Variant",
      value: getListingVariant(listing) || "",
    },
    {
      key: "colors",
      label: "Color",
      value: listing.color || "",
    },
    {
      key: "doors",
      label: "Doors",
      value:
        listing.doors != null
          ? String(listing.doors)
          : getListingMetadataString(listing, "doors") || "",
    },
    {
      key: "seats",
      label: "Seats",
      value:
        listing.seats != null
          ? String(listing.seats)
          : getListingMetadataString(listing, "seats") || "",
    },
    {
      key: "location",
      label: "Location",
      value: location || listing.dealer?.city || "Kenya",
    },
  ];

  return items.filter((item) => Boolean(item.value));
}
