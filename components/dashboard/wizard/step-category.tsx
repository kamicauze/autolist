"use client";

import { VehicleCategoryIcon } from "@/components/home/vehicle-category-icon";
import { LISTING_CATEGORY_OPTIONS } from "@/lib/constants/marketplace";
import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";

const VISIBLE_LISTING_CATEGORIES = LISTING_CATEGORY_OPTIONS.filter(
  (category) => category.value !== "van"
);

function getCategoryLabel(category: (typeof LISTING_CATEGORY_OPTIONS)[number]) {
  return category.value === "car" ? "Cars & Vans" : category.label;
}

export function StepCategory() {
  const { draft, updateField, showValidationErrors } = useWizard();

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Select Category</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#767676]">
          Choose the inventory segment before adding listing details. The category controls the
          specifications, features, and moderation checks shown in later steps.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {VISIBLE_LISTING_CATEGORIES.map((category) => {
          const selected = draft.category === category.value;
          const label = getCategoryLabel(category);

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => updateField("category", category.value)}
              className={cn(
                "rounded-[14px] border bg-white p-4 text-left transition",
                selected
                  ? "border-primary bg-brand-tint shadow-[0_16px_32px_rgb(var(--primary-rgb)/0.10)]"
                  : "border-[#ededed] hover:border-[#cfdaf7] hover:bg-[#fbfdff]",
                showValidationErrors && !draft.category && "border-[#f04438]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <VehicleCategoryIcon
                  category={category.value}
                  className="h-16 w-16 shrink-0 object-contain"
                />
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-[12px] font-semibold",
                    selected ? "bg-white text-primary" : "bg-[#f5f5f5] text-[#848484]"
                  )}
                >
                  {selected ? "Selected" : "Available"}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-heading text-[18px] font-semibold text-[#202224]">
                  {label}
                </h3>
                <p className="mt-1 text-[12px] leading-5 text-[#727272]">
                  Use this when the listing fits the {label.toLowerCase()} segment.
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
