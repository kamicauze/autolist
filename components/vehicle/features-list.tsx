"use client";

import { Check } from "lucide-react";
import {
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURE_INDEX,
} from "@/lib/constants/marketplace";
import { formatListingLabel } from "@/lib/utils/listing-details";

interface FeaturesListProps {
  features: string[] | null;
}

const CATEGORIZED_FEATURES: Record<string, string[]> = {
  "Comfort & Convenience": [
    "Automatic Climate Control",
    "Power Steering",
    "Power Windows Front",
    "Power Windows Rear",
    "Power Adjustable Exterior Rear View Mirror",
    "Engine Start Stop Button",
  ],
  "Engine/Performance": [
    "Turbo Charger",
    "Multi-function Steering Wheel",
    "Cruise Control",
    "Paddle Shifters",
  ],
  "Entertainment": [
    "Touch Screen",
    "Bluetooth Connectivity",
    "USB & Auxiliary Input",
    "Speakers",
  ],
  "Safety": [
    "Driver Airbag",
    "Passenger Airbag",
    "Anti Lock Braking System",
    "Child Safety Locks",
    "Traction Control",
  ],
  "Exterior": [
    "Alloy Wheels",
    "Fog Lights - Front",
    "LED Headlamps",
    "Roof Rails",
  ],
  "Interior": [
    "Leather Seats",
    "Rear AC Vents",
    "Cup Holders",
    "Ambient Lighting",
  ],
};

function getGroupLabel(groupKey: string) {
  for (const definition of Object.values(LISTING_FEATURE_GROUPS_BY_CATEGORY)) {
    const label = definition.labels[groupKey];
    if (label) return label;
  }

  return "Other Features";
}

function groupProvidedFeatures(features: string[]) {
  const grouped = new Map<string, string[]>();

  for (const feature of features) {
    const definition = LISTING_FEATURE_INDEX[feature];
    const groupLabel = definition ? getGroupLabel(definition.group) : "Other Features";
    const label = definition?.label ?? formatListingLabel(feature);
    const existing = grouped.get(groupLabel) ?? [];
    existing.push(label);
    grouped.set(groupLabel, existing);
  }

  return Array.from(grouped.entries());
}

function FeatureItem({ feature }: { feature: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
        <Check className="h-3 w-3 text-green-600" />
      </div>
      <span className="text-sm text-gray-700">{feature}</span>
    </div>
  );
}

export function FeaturesList({ features }: FeaturesListProps) {
  const hasProvidedFeatures = features && features.length > 0;

  if (hasProvidedFeatures) {
    return (
      <div className="space-y-6">
        {groupProvidedFeatures(features).map(([category, items]) => (
          <div key={category}>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">{category}</h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((feature, index) => (
                <FeatureItem key={`${feature}-${index}`} feature={feature} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(CATEGORIZED_FEATURES).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">{category}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {items.map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
