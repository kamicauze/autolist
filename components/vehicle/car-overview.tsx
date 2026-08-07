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
  buildListingOverviewItems,
  type ListingOverviewItem,
} from "@/lib/utils/listing-overview";

interface CarOverviewProps {
  listing: Listing;
  location?: string;
}

const OVERVIEW_ICONS: Record<string, React.ReactNode> = {
  Mileage: <Gauge className="h-4 w-4" />,
  Condition: <BadgeCheck className="h-4 w-4" />,
  Registration: <BadgeCheck className="h-4 w-4" />,
  "Fuel Type": <Fuel className="h-4 w-4" />,
  CC: <Cog className="h-4 w-4" />,
  Transmission: <Settings className="h-4 w-4" />,
  "Drive type": <Settings className="h-4 w-4" />,
  "Body Type": <Car className="h-4 w-4" />,
  Category: <Car className="h-4 w-4" />,
  Subcategory: <Cog className="h-4 w-4" />,
  Trim: <Car className="h-4 w-4" />,
  "Model Variant": <Cog className="h-4 w-4" />,
  Color: <Palette className="h-4 w-4" />,
  Doors: <DoorOpen className="h-4 w-4" />,
  Seats: <Users className="h-4 w-4" />,
  Location: <MapPin className="h-4 w-4" />,
};

function OverviewItem({ item }: { item: ListingOverviewItem }) {
  const icon = OVERVIEW_ICONS[item.label];

  return (
    <div className="flex gap-2 rounded-lg border border-gray-100 bg-white p-3">
      {icon ? <div className="mt-0.5 shrink-0 text-gray-400">{icon}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{item.label}</p>
        <p className="break-words text-sm font-semibold leading-snug text-gray-900">
          {item.value}
        </p>
      </div>
    </div>
  );
}

export function CarOverview({ listing, location }: CarOverviewProps) {
  const items = buildListingOverviewItems(listing, location);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <OverviewItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}
