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
  label: string;
  value: string;
}

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

  return [
    {
      label: "Mileage",
      value: getListingMileageLabel(listing),
    },
    {
      label: "Year",
      value: String(listing.year),
    },
    {
      label: "Condition",
      value: conditionLabel(listing),
    },
    {
      label: "Registration",
      value: registrationStatus(listing),
    },
    {
      label: "Fuel Type",
      value: getListingFuelTypeLabel(listing),
    },
    {
      label: "CC",
      value: getListingEngineDisplacement(listing) || "",
    },
    {
      label: "Transmission",
      value: getListingTransmissionLabel(listing),
    },
    {
      label: "Drive type",
      value: driveTypeLabel(listing),
    },
    {
      label: equipmentTaxonomy ? "Category" : "Body Type",
      value: equipmentTaxonomy
        ? getListingMetadataString(listing, "taxonomyCategory") || ""
        : getListingBodyTypeLabel(listing, ""),
    },
    {
      label: "Subcategory",
      value: equipmentTaxonomy
        ? getListingMetadataString(listing, "subcategory") ||
          getListingMetadataString(listing, "subCategory") ||
          ""
        : "",
    },
    {
      label: "Trim",
      value: getListingTrim(listing) || "",
    },
    {
      label: "Model Variant",
      value: getListingVariant(listing) || "",
    },
    {
      label: "Color",
      value: listing.color || "",
    },
    {
      label: "Doors",
      value:
        listing.doors != null
          ? String(listing.doors)
          : getListingMetadataString(listing, "doors") || "",
    },
    {
      label: "Seats",
      value:
        listing.seats != null
          ? String(listing.seats)
          : getListingMetadataString(listing, "seats") || "",
    },
    {
      label: "Location",
      value: location || listing.dealer?.city || "Kenya",
    },
  ].filter((item) => Boolean(item.value));
}
