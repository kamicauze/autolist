"use client";

import {
  Car,
  Fuel,
  Gauge,
  Settings,
  MapPin,
  Cog,
  DoorOpen,
  Palette,
  Users,
  BadgeCheck,
} from "lucide-react";
import { Listing } from "@/lib/types/listing";
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
  formatListingRegistrationStatus,
  getListingMetadataString,
} from "@/lib/utils/listing-details";

interface CarOverviewProps {
  listing: Listing;
  location?: string;
}

interface Item {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function readMetadataValue(metadata: Listing["metadata"], key: string) {
  const value = metadata && key in metadata ? metadata[key] : null;
  return value == null ? "" : String(value);
}

function formatRegistrationStatus(listing: Listing) {
  const status = getListingMetadataString(listing, "registrationStatus");
  const label = formatListingRegistrationStatus(status);
  return label === "N/A" ? "" : label;
}

function OverviewItem({ item }: { item: Item }) {
  return (
    <div className="flex gap-2 rounded-lg border border-gray-100 bg-white p-3">
      {item.icon ? <div className="mt-0.5 text-gray-400">{item.icon}</div> : null}
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{item.label}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{item.value}</p>
      </div>
    </div>
  );
}

export function CarOverview({ listing, location }: CarOverviewProps) {
  const items: Item[] = [
    {
      label: "Mileage",
      value: getListingMileageLabel(listing),
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      label: "Year",
      value: String(listing.year),
    },
    {
      label: "Registration",
      value: formatRegistrationStatus(listing),
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    {
      label: "Fuel Type",
      value: getListingFuelTypeLabel(listing),
      icon: <Fuel className="h-4 w-4" />,
    },
    {
      label: "CC",
      value: getListingEngineDisplacement(listing) || "",
      icon: <Cog className="h-4 w-4" />,
    },
    {
      label: "Transmission",
      value: getListingTransmissionLabel(listing),
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: "Body Type",
      value: getListingBodyTypeLabel(listing, ""),
      icon: <Car className="h-4 w-4" />,
    },
    {
      label: "Trim",
      value: getListingTrim(listing) || "",
      icon: <Car className="h-4 w-4" />,
    },
    {
      label: "Model Variant",
      value: getListingVariant(listing) || "",
      icon: <Cog className="h-4 w-4" />,
    },
    {
      label: "Color",
      value: listing.color || "",
      icon: <Palette className="h-4 w-4" />,
    },
    {
      label: "Doors",
      value: listing.doors ? String(listing.doors) : readMetadataValue(listing.metadata, "doors"),
      icon: <DoorOpen className="h-4 w-4" />,
    },
    {
      label: "Seats",
      value: listing.seats ? String(listing.seats) : readMetadataValue(listing.metadata, "seats"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Location",
      value: location || listing.dealer?.city || "Kenya",
      icon: <MapPin className="h-4 w-4" />,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <OverviewItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}
