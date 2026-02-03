"use client";

import { Listing } from "@/lib/types/listing";
import {
  Gauge,
  Fuel,
  Settings,
  Calendar,
  Palette,
  Users,
  Car,
  Hash,
  FileText,
  DoorOpen,
  Cog,
} from "lucide-react";

interface CarOverviewProps {
  listing: Listing;
}

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

function SpecItem({ icon, label, value }: SpecItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || "N/A"}</p>
      </div>
    </div>
  );
}

export function CarOverview({ listing }: CarOverviewProps) {
  const formatCondition = (condition: string | null) => {
    if (!condition) return "N/A";
    return condition.charAt(0).toUpperCase() + condition.slice(1).replace(/_/g, " ");
  };

  const specs = [
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Condition",
      value: formatCondition(listing.condition),
    },
    {
      icon: <Hash className="h-5 w-5" />,
      label: "Cylinders",
      value: listing.metadata?.cylinders || "N/A",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Stock number",
      value: listing.metadata?.stock_number || listing.id.slice(0, 8).toUpperCase(),
    },
    {
      icon: <Fuel className="h-5 w-5" />,
      label: "Fuel Type",
      value: listing.fuel_type,
    },
    {
      icon: <Hash className="h-5 w-5" />,
      label: "VIN number",
      value: listing.metadata?.vin || "N/A",
    },
    {
      icon: <DoorOpen className="h-5 w-5" />,
      label: "Doors",
      value: listing.metadata?.doors || "4",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Year",
      value: listing.year,
    },
    {
      icon: <Palette className="h-5 w-5" />,
      label: "Color",
      value: listing.color,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Seats",
      value: listing.metadata?.seats || "5",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Transmission",
      value: listing.transmission,
    },
    {
      icon: <Gauge className="h-5 w-5" />,
      label: "City MPG",
      value: listing.metadata?.city_mpg || "N/A",
    },
    {
      icon: <Cog className="h-5 w-5" />,
      label: "Engine Size",
      value: listing.metadata?.engine_size || "N/A",
    },
    {
      icon: <Gauge className="h-5 w-5" />,
      label: "Highway MPG",
      value: listing.metadata?.highway_mpg || "N/A",
    },
    {
      icon: <Car className="h-5 w-5" />,
      label: "Drive Type",
      value: listing.metadata?.drive_type || "N/A",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Car overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
        {specs.map((spec, index) => (
          <SpecItem
            key={index}
            icon={spec.icon}
            label={spec.label}
            value={spec.value as string}
          />
        ))}
      </div>
    </div>
  );
}
