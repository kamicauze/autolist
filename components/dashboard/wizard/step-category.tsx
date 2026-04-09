"use client";

import { Bike, Bus, CarFront, Construction, Tractor, Truck } from "lucide-react";
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
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
        <h2 className="font-heading text-[28px] font-semibold text-[#202224]">Select Category</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#767676]">
          Choose the inventory segment before adding listing details. The category controls the
          specifications, features, and moderation checks shown in later steps.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {LISTING_CATEGORY_OPTIONS.map((category) => {
          const selected = draft.category === category.value;
          const Icon = CATEGORY_ICONS[category.value];

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => updateField("category", category.value)}
              className={cn(
                "rounded-[24px] border bg-white p-5 text-left transition",
                selected
                  ? "border-[#2563eb] bg-[#eef4ff] shadow-[0_16px_32px_rgba(37,99,235,0.10)]"
                  : "border-[#ededed] hover:border-[#cfdaf7] hover:bg-[#fbfdff]",
                showValidationErrors && !draft.category && "border-[#f04438]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-[18px]",
                    selected ? "bg-[#2563eb] text-white" : "bg-[#f5f5f5] text-[#7f7f7f]"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-[12px] font-semibold",
                    selected ? "bg-white text-[#2563eb]" : "bg-[#f5f5f5] text-[#848484]"
                  )}
                >
                  {selected ? "Selected" : "Available"}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-heading text-[22px] font-semibold text-[#202224]">
                  {category.label}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[#727272]">
                  Use this when the listing fits the {category.label.toLowerCase()} segment.
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
