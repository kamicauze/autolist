"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fetchVehicleReferenceOptionsAction } from "@/lib/actions/car-data";
import type { VehicleReferenceOptions } from "@/lib/data/vehicle-reference-catalog";
import { useWizard } from "./wizard-context";
import {
  sellerInputClass,
  sellerLabelClass,
  sellerSelectClass,
} from "../seller-dashboard-ui";

const EMPTY_REFERENCE_OPTIONS: VehicleReferenceOptions = {
  makes: [],
  models: [],
  trimOptions: [],
  variants: [],
};

export function StepVehicleDetails() {
  const { draft, updateDetailField, showValidationErrors, selectedCategoryFields } = useWizard();
  const [referenceOptions, setReferenceOptions] = React.useState<VehicleReferenceOptions>(
    EMPTY_REFERENCE_OPTIONS
  );

  const isCarCategory = draft.category === "car";
  const hasStructuredMakeSuggestions =
    !isCarCategory && referenceOptions.makes.length > 0;

  React.useEffect(() => {
    let cancelled = false;

    async function loadReferenceOptions() {
      if (!draft.category) {
        setReferenceOptions(EMPTY_REFERENCE_OPTIONS);
        return;
      }

      const nextOptions = await fetchVehicleReferenceOptionsAction(
        draft.category,
        draft.details.make,
        draft.details.model
      );

      if (!cancelled) {
        setReferenceOptions(nextOptions);
      }
    }

    void loadReferenceOptions();

    return () => {
      cancelled = true;
    };
  }, [draft.category, draft.details.make, draft.details.model, isCarCategory]);

  const renderReferenceField = (field: (typeof selectedCategoryFields)[number], hasError: boolean) => {
    if (field.key === "make") {
      if (!isCarCategory && hasStructuredMakeSuggestions) {
        return (
          <>
            <input
              list={`detail-make-options-${draft.category}`}
              value={draft.details.make}
              onChange={(event) => updateDetailField("make", event.target.value)}
              placeholder={field.placeholder}
              className={cn(sellerInputClass, hasError && "border-[#f04438]")}
            />
            <datalist id={`detail-make-options-${draft.category}`}>
              {referenceOptions.makes.map((make) => (
                <option key={make} value={make} />
              ))}
            </datalist>
            {referenceOptions.makeHelperText ? (
              <p className="mt-2 text-[12px] text-[#767676]">
                {referenceOptions.makeHelperText}
              </p>
            ) : null}
          </>
        );
      }

      if (!isCarCategory) return null;

      return (
        <select
          value={draft.details.make}
          onChange={(event) => updateDetailField("make", event.target.value)}
          className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
        >
          <option value="">Select make</option>
          {referenceOptions.makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      );
    }

    if (field.key === "model") {
      if (!isCarCategory && referenceOptions.modelInputMode === "manual") {
        return (
          <>
            <input
              value={draft.details.model}
              onChange={(event) => updateDetailField("model", event.target.value)}
              placeholder={field.placeholder}
              className={cn(sellerInputClass, hasError && "border-[#f04438]")}
            />
            {referenceOptions.modelHelperText ? (
              <p className="mt-2 text-[12px] text-[#767676]">
                {referenceOptions.modelHelperText}
              </p>
            ) : null}
          </>
        );
      }

      if (!isCarCategory) return null;

      return (
        <select
          value={draft.details.model}
          onChange={(event) => updateDetailField("model", event.target.value)}
          disabled={!draft.details.make}
          className={cn(
            sellerSelectClass,
            !draft.details.make && "cursor-not-allowed bg-[#f7f7f7] text-[#9a9a9a]",
            hasError && "border-[#f04438]"
          )}
        >
          <option value="">{draft.details.make ? "Select model" : "Select make first"}</option>
          {referenceOptions.models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      );
    }

    if (field.key === "trim") {
      if (!isCarCategory) return null;

      return (
        <>
          <select
            value={draft.details.trim}
            onChange={(event) => updateDetailField("trim", event.target.value)}
            disabled={!draft.details.model || referenceOptions.trimOptions.length === 0}
            className={cn(
              sellerSelectClass,
              (!draft.details.model || referenceOptions.trimOptions.length === 0) &&
                "cursor-not-allowed bg-[#f7f7f7] text-[#9a9a9a]",
              hasError && "border-[#f04438]"
            )}
          >
            <option value="">
              {!draft.details.model
                ? "Select model first"
                : referenceOptions.trimOptions.length > 0
                  ? "Select trim"
                  : "No trim catalog for this model"}
            </option>
            {referenceOptions.trimOptions.map((trim) => (
              <option key={`${trim.source}-${trim.value}`} value={trim.value}>
                {trim.label}
                {trim.source === "model" ? " (model-specific)" : " (shared)"}
              </option>
            ))}
          </select>
          {draft.details.model ? (
            <p className="mt-2 text-[12px] text-[#767676]">
              {referenceOptions.trimOptions.some((trim) => trim.source === "model")
                ? "Model-specific trims are shown first. Shared make trims for this model remain available below."
                : "This model is currently using inherited make trims that were attached directly to the selected model."}
            </p>
          ) : null}
        </>
      );
    }

    if (field.key === "variant") {
      if (!isCarCategory) return null;

      return (
        <>
          <select
            value={draft.details.variant}
            onChange={(event) => updateDetailField("variant", event.target.value)}
            disabled={!draft.details.model || referenceOptions.variants.length === 0}
            className={cn(
              sellerSelectClass,
              (!draft.details.model || referenceOptions.variants.length === 0) &&
                "cursor-not-allowed bg-[#f7f7f7] text-[#9a9a9a]",
              hasError && "border-[#f04438]"
            )}
          >
            <option value="">
              {!draft.details.model
                ? "Select model first"
                : referenceOptions.variants.length > 0
                  ? "Select variant / engine"
                  : "No engine variants cataloged"}
            </option>
            {referenceOptions.variants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
          {referenceOptions.variants.length > 0 ? (
            <p className="mt-2 text-[12px] text-[#767676]">
              Use this field for engine or drivetrain naming such as BMW `xDrive30d` or Mercedes
              `C200`.
            </p>
          ) : null}
        </>
      );
    }

    return null;
  };

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

      {isCarCategory ? (
        <div className="rounded-[18px] border border-[#dbe8ff] bg-[#f6f9ff] px-4 py-3 text-[13px] leading-6 text-[#3157c8]">
          Step 3 now uses a structured vehicle catalog: make leads to model, then trim and
          engine-specific variants. Every trim is loaded against the selected model, with inherited
          shared trims clearly labeled.
        </div>
      ) : hasStructuredMakeSuggestions ? (
        <div className="rounded-[18px] border border-[#dcefe0] bg-[#f4fbf6] px-4 py-3 text-[13px] leading-6 text-[#25653b]">
          Suggested make options are now loaded for this category. Models still stay manual where
          the catalog does not define a reliable model list.
        </div>
      ) : null}

      <section className="rounded-[24px] border border-[#ededed] bg-white p-5">
        <div className="grid gap-5 md:grid-cols-2">
          {selectedCategoryFields.map((field) => {
            const hasError = showValidationErrors && field.required && !draft.details[field.key].trim();
            const referenceField = renderReferenceField(field, hasError);

            return (
              <div key={field.key}>
                <label className={sellerLabelClass}>
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                {referenceField ? (
                  referenceField
                ) : field.type === "select" ? (
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
