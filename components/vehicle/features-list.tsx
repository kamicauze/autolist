"use client";

import { Check } from "lucide-react";

interface FeaturesListProps {
  features: string[] | null;
}

// Default features to show if none are provided
const DEFAULT_FEATURES = [
  "Touch Screen",
  "Alloy Wheels",
  "Fog Lights - Front",
  "Anti Lock Braking System",
  "Multi-function Steering Wheel",
  "Automatic Climate Control",
  "Power Windows Rear",
  "Engine Start Stop Button",
  "Power Steering",
  "Power Windows Front",
  "Passenger Airbag",
  "Driver Airbag",
  "Air Conditioner",
  "Power Adjustable Exterior Rear View Mirror",
];

export function FeaturesList({ features }: FeaturesListProps) {
  const displayFeatures = features && features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
