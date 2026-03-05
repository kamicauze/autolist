"use client";

import { CarFront, Bus, Bike, Truck, Tractor, Construction } from "lucide-react";
import { LISTING_CATEGORY_OPTIONS, type ListingCategory } from "@/lib/constants/marketplace";
import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";

const CATEGORY_ICONS: Record<ListingCategory, React.ElementType> = {
  car: CarFront,
  van: Bus,
  motorbike: Bike,
  truck: Truck,
  plant_construction: Construction,
  farm_agricultural: Tractor,
};

export function StepCategory() {
  const { draft, updateField, showValidationErrors } = useWizard();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Select Category</h2>
      <p className="text-sm text-muted-foreground">
        Choose a category for your listing. This determines the fields available in subsequent steps.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LISTING_CATEGORY_OPTIONS.map((category) => {
          const selected = draft.category === category.value;
          const Icon = CATEGORY_ICONS[category.value];
          return (
            <button
              key={category.value}
              type="button"
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-white hover:border-primary/40",
                showValidationErrors && !draft.category && "border-destructive"
              )}
              onClick={() => updateField("category", category.value)}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg",
                selected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-foreground">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
