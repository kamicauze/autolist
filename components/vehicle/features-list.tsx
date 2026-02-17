"use client";

import { Check } from "lucide-react";

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

export function FeaturesList({ features }: FeaturesListProps) {
  const hasProvidedFeatures = features && features.length > 0;

  if (hasProvidedFeatures) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-sm text-gray-700">{feature}</span>
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
              <div key={index} className="flex items-center gap-2">
                <div className="shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
