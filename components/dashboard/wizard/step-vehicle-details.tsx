"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { COLORS } from "@/lib/constants/filters";
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

const COLOR_SWATCHES: Record<string, string> = {
  White: "#f8fafc",
  Black: "#111827",
  Silver: "#cbd5e1",
  Grey: "#6b7280",
  Blue: "#2563eb",
  Red: "#dc2626",
  Green: "#16a34a",
  Brown: "#92400e",
  Beige: "#d6c4a8",
  Orange: "#ea580c",
  Yellow: "#facc15",
  Gold: "#d4af37",
  Maroon: "#7f1d1d",
  Navy: "#1e3a8a",
  Bronze: "#b45309",
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

      setReferenceOptions((previous) => ({
        ...previous,
        models: draft.details.make ? previous.models : [],
        trimOptions: [],
        variants: [],
      }));

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

      return (
        <>
          <input
            list={`detail-make-options-${draft.category || "car"}`}
            value={draft.details.make}
            onChange={(event) => updateDetailField("make", event.target.value)}
            placeholder={field.placeholder}
            className={cn(sellerInputClass, hasError && "border-[#f04438]")}
          />
          <datalist id={`detail-make-options-${draft.category || "car"}`}>
            {referenceOptions.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </datalist>
        </>
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

      return (
        <>
          <input
            list={`detail-model-options-${draft.category || "car"}`}
            value={draft.details.model}
            onChange={(event) => updateDetailField("model", event.target.value)}
            disabled={!draft.details.make}
            placeholder={draft.details.make ? field.placeholder : "Select make first"}
            className={cn(
              sellerInputClass,
              !draft.details.make && "cursor-not-allowed bg-[#f7f7f7] text-[#9a9a9a]",
              hasError && "border-[#f04438]"
            )}
          />
          <datalist id={`detail-model-options-${draft.category || "car"}`}>
            {referenceOptions.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </datalist>
        </>
      );
    }

    if (field.key === "trim") {
      return (
        <>
          <input
            list={`detail-trim-options-${draft.category || "car"}`}
            value={draft.details.trim}
            onChange={(event) => updateDetailField("trim", event.target.value)}
            placeholder="Type trim or package, e.g. AMG Line, M Sport, TX"
            className={cn(
              sellerInputClass,
              hasError && "border-[#f04438]"
            )}
          />
          <datalist id={`detail-trim-options-${draft.category || "car"}`}>
            {referenceOptions.trimOptions.map((trim) => (
              <option key={`${trim.source}-${trim.value}`} value={trim.value}>
                {trim.label}
              </option>
            ))}
          </datalist>
          {draft.details.model && referenceOptions.trimOptions.length > 0 ? (
            <p className="mt-2 text-[12px] text-[#767676]">
              Suggestions are model-specific where available. Use this for trim, package, or grade, not engine displacement.
            </p>
          ) : null}
        </>
      );
    }

    if (field.key === "variant") {
      return (
        <>
          <input
            list={`detail-variant-options-${draft.category || "car"}`}
            value={draft.details.variant}
            onChange={(event) => updateDetailField("variant", event.target.value)}
            placeholder={field.placeholder}
            className={cn(
              sellerInputClass,
              hasError && "border-[#f04438]"
            )}
          />
          <datalist id={`detail-variant-options-${draft.category || "car"}`}>
            {referenceOptions.variants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </datalist>
          {referenceOptions.variants.length > 0 ? (
            <p className="mt-2 text-[12px] text-[#767676]">
              Use this for complex model variants such as C200, 320i, Cayenne S, or xDrive30d.
            </p>
          ) : null}
        </>
      );
    }

    if (field.key === "color") {
      const isKnownColor = COLORS.includes(draft.details.color as (typeof COLORS)[number]);
      const isCustomColor = draft.details.color.trim().length > 0 && !isKnownColor;

      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => {
              const isSelected = draft.details.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateDetailField("color", color)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-medium transition",
                    isSelected
                      ? "border-[#2563eb] bg-[#eef4ff] text-[#2563eb]"
                      : "border-[#e4e7ec] bg-white text-[#202224] hover:border-[#2563eb]"
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ backgroundColor: COLOR_SWATCHES[color] ?? color.toLowerCase() }}
                  />
                  {color}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => updateDetailField("color", isCustomColor ? draft.details.color : "")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-medium transition",
                isCustomColor
                  ? "border-[#2563eb] bg-[#eef4ff] text-[#2563eb]"
                  : "border-[#e4e7ec] bg-white text-[#202224] hover:border-[#2563eb]"
              )}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[conic-gradient(from_90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] text-white">
                <Palette className="h-3 w-3" />
              </span>
              Other
            </button>
          </div>
          <input
            value={isKnownColor ? "" : draft.details.color}
            onChange={(event) => updateDetailField("color", event.target.value)}
            placeholder="Type preferred color, e.g. Champagne, Pearl White, Two-tone"
            className={cn(sellerInputClass, hasError && "border-[#f04438]")}
          />
          <p className="text-[12px] text-[#767676]">
            Pick a common exterior color or type a preferred color when the exact shade is not listed.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
          Vehicle / Equipment Details
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#767676]">
          Fill in the technical fields required for the selected seller category.
        </p>
      </div>

      {!draft.category ? (
        <div className="rounded-[18px] border border-[#ffe4bf] bg-[#fff8eb] px-4 py-3 text-[14px] text-[#996a18]">
          Select a category in the previous step to load the correct specification fields.
        </div>
      ) : null}

      {isCarCategory ? (
        <div className="rounded-[12px] border border-[#dbe8ff] bg-[#f6f9ff] px-4 py-3 text-[12px] leading-5 text-[#3157c8]">
          Step 3 now uses a structured vehicle catalog: make leads to model, then trim and
          engine-specific variants. Every trim is loaded against the selected model, with inherited
          shared trims clearly labeled.
        </div>
      ) : hasStructuredMakeSuggestions ? (
        <div className="rounded-[12px] border border-[#dcefe0] bg-[#f4fbf6] px-4 py-3 text-[12px] leading-5 text-[#25653b]">
          Suggested make options are now loaded for this category. Models still stay manual where
          the catalog does not define a reliable model list.
        </div>
      ) : null}

      <section className="rounded-[14px] border border-[#ededed] bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      <section className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7b8190]">
          Details Summary
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {selectedCategoryFields.map((field) => (
            <div key={field.key} className="rounded-[12px] border border-[#ededed] bg-white p-3">
              <p className="text-[12px] uppercase tracking-[0.14em] text-[#9a9a9a]">{field.label}</p>
              <p className="mt-1 text-[13px] font-semibold text-[#202224]">
                {draft.details[field.key] || "Not entered"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
