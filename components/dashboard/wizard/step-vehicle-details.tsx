"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";
import { sellerInputClass, sellerLabelClass, sellerSelectClass } from "../seller-dashboard-ui";

export function StepVehicleDetails() {
  const { draft, updateDetailField, showValidationErrors, selectedCategoryFields } = useWizard();

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
        <h2 className="font-heading text-[28px] font-semibold text-[#202224]">
          Vehicle / Equipment Details
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#767676]">
          Fill in the technical fields required for the selected seller category.
        </p>
      </div>

      {!draft.category ? (
        <div className="rounded-[18px] border border-[#ffe4bf] bg-[#fff8eb] px-4 py-3 text-[14px] text-[#996a18]">
          Select a category in the previous step to load the correct specification fields.
        </div>
      ) : null}

      <section className="rounded-[24px] border border-[#ededed] bg-white p-5">
        <div className="grid gap-5 md:grid-cols-2">
          {selectedCategoryFields.map((field) => {
            const hasError = showValidationErrors && field.required && !draft.details[field.key].trim();

            return (
              <div key={field.key}>
                <label className={sellerLabelClass}>
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                {field.type === "select" ? (
                  <select
                    value={draft.details[field.key]}
                    onChange={(event) => updateDetailField(field.key, event.target.value)}
                    className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
                  >
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={draft.details[field.key]}
                    onChange={(event) => updateDetailField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className={cn(sellerInputClass, hasError && "border-[#f04438]")}
                  />
                )}
                {hasError ? (
                  <p className="mt-2 text-[12px] text-[#f04438]">{field.label} is required.</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7b8190]">
          Details Summary
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {selectedCategoryFields.map((field) => (
            <div key={field.key} className="rounded-[18px] border border-[#ededed] bg-white p-4">
              <p className="text-[12px] uppercase tracking-[0.14em] text-[#9a9a9a]">{field.label}</p>
              <p className="mt-2 text-[14px] font-semibold text-[#202224]">
                {draft.details[field.key] || "Not entered"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
