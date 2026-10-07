"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { COLORS } from "@/lib/constants/filters";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { fetchVehicleReferenceOptionsAction } from "@/lib/actions/car-data";
import { MAKES_BY_CATEGORY } from "@/lib/constants/vehicle-taxonomy";
import type { VehicleReferenceOptions } from "@/lib/data/vehicle-reference-catalog";
import { formatDetailSummaryValue, useWizard } from "./wizard-context";
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

const OTHER_COLOR_VALUE = "__other__";

// Shades offered once the seller picks "Other" in the color dropdown.
const EXTENDED_COLOR_PALETTE: Array<{ name: string; swatch: string }> = [
  { name: "Pearl White", swatch: "#f4f1ea" },
  { name: "Cream", swatch: "#f3e9c6" },
  { name: "Champagne", swatch: "#e2cfa3" },
  { name: "Khaki", swatch: "#c3b091" },
  { name: "Titanium", swatch: "#878681" },
  { name: "Gunmetal", swatch: "#4b5563" },
  { name: "Graphite", swatch: "#41424c" },
  { name: "Charcoal", swatch: "#36454f" },
  { name: "Midnight Blue", swatch: "#1e1b4b" },
  { name: "Sky Blue", swatch: "#7dd3fc" },
  { name: "Turquoise", swatch: "#14b8a6" },
  { name: "Teal", swatch: "#0f766e" },
  { name: "Olive", swatch: "#6b7d2a" },
  { name: "Lime", swatch: "#84cc16" },
  { name: "Burgundy", swatch: "#800020" },
  { name: "Wine", swatch: "#722f37" },
  { name: "Copper", swatch: "#b87333" },
  { name: "Purple", swatch: "#7c3aed" },
  { name: "Pink", swatch: "#ec4899" },
  { name: "Two-tone", swatch: "linear-gradient(135deg,#111827 50%,#f8fafc 50%)" },
];

const COLOR_OPTIONS = [
  ...COLORS.map((color) => ({
    value: color,
    label: color,
    swatch: COLOR_SWATCHES[color] ?? color.toLowerCase(),
  })),
  {
    value: OTHER_COLOR_VALUE,
    label: "Other (choose from palette)",
    icon: (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] text-white">
        <Palette className="h-3 w-3" />
      </span>
    ),
  },
];

export function StepVehicleDetails() {
  const { draft, updateDetailField, showValidationErrors, selectedCategoryFields } = useWizard();
  const [referenceOptions, setReferenceOptions] = React.useState<VehicleReferenceOptions>(
    EMPTY_REFERENCE_OPTIONS
  );

  const isCarCategory = draft.category === "car";
  const hasStructuredMakeSuggestions =
    !isCarCategory && referenceOptions.makes.length > 0;
  const taxonomyMakes = draft.category ? MAKES_BY_CATEGORY[draft.category] : undefined;
  const [manualMakeMode, setManualMakeMode] = React.useState(false);
  const [colorPaletteOpen, setColorPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    setManualMakeMode(false);
    setColorPaletteOpen(false);
  }, [draft.category]);

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
      const makeOptions = isCarCategory ? referenceOptions.makes : taxonomyMakes;
      if (makeOptions && makeOptions.length > 0) {
        const isListedMake = makeOptions.includes(draft.details.make);
        const showManualInput =
          manualMakeMode || (draft.details.make.trim().length > 0 && !isListedMake);

        return (
          <div className="space-y-2">
            <SearchableSelect
              value={showManualInput ? "__other__" : draft.details.make}
              onChange={(value) => {
                if (value === "__other__") {
                  setManualMakeMode(true);
                  if (isListedMake) updateDetailField("make", "");
                } else {
                  setManualMakeMode(false);
                  updateDetailField("make", value);
                }
              }}
              options={[
                ...makeOptions.map((make) => ({ value: make, label: make })),
                { value: "__other__", label: "Other (enter manually)" },
              ]}
              placeholder="Select make"
              searchPlaceholder="Search make"
              aria-label={field.label}
              className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
            />
            {showManualInput ? (
              <input
                value={draft.details.make}
                onChange={(event) => updateDetailField("make", event.target.value)}
                placeholder="Type the make if it is not in the list"
                className={cn(sellerInputClass, hasError && "border-[#f04438]")}
              />
            ) : null}
          </div>
        );
      }

      if (!isCarCategory && hasStructuredMakeSuggestions) {
        return (
          <>
            <SearchableSelect
              value={draft.details.make}
              onChange={(value) => updateDetailField("make", value)}
              options={referenceOptions.makes.map((make) => ({ value: make, label: make }))}
              allowCustomValue
              placeholder="Select make"
              searchPlaceholder="Search or type a make"
              aria-label={field.label}
              className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
            />
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
          <SearchableSelect
            value={draft.details.make}
            onChange={(value) => updateDetailField("make", value)}
            options={referenceOptions.makes.map((make) => ({ value: make, label: make }))}
            allowCustomValue
            placeholder="Select make"
            searchPlaceholder="Search or type a make"
            aria-label={field.label}
            className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
          />
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
          <SearchableSelect
            value={draft.details.model}
            onChange={(value) => updateDetailField("model", value)}
            options={referenceOptions.models.map((model) => ({ value: model, label: model }))}
            allowCustomValue
            disabled={!draft.details.make}
            placeholder={draft.details.make ? "Select model" : "Select make first"}
            searchPlaceholder="Search or type a model"
            aria-label={field.label}
            className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
          />
        </>
      );
    }

    if (field.key === "trim") {
      const selectedTrimTokens = draft.details.trim
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const selectedTrimSet = new Set(selectedTrimTokens.map((value) => value.toLowerCase()));
      const setTrimTokens = (tokens: string[]) => {
        updateDetailField(
          "trim",
          Array.from(new Set(tokens.map((value) => value.trim()).filter(Boolean))).join(", ")
        );
      };

      return (
        <>
          <input
            list={`detail-trim-options-${draft.category || "car"}`}
            value={draft.details.trim}
            onChange={(event) => updateDetailField("trim", event.target.value)}
            placeholder="Type one or more trims/variants, e.g. AMG Line, M Sport, TX"
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
            <div className="mt-3 space-y-2">
              <p className="text-[12px] text-[#767676]">
                Suggestions are model-specific where available. Select more than one trim or package when applicable.
              </p>
              <div className="flex flex-wrap gap-2">
                {referenceOptions.trimOptions.slice(0, 10).map((trim) => {
                  const selected = selectedTrimSet.has(trim.value.toLowerCase());
                  return (
                    <button
                      key={`${trim.source}-${trim.value}`}
                      type="button"
                      onClick={() => {
                        setTrimTokens(
                          selected
                            ? selectedTrimTokens.filter((value) => value.toLowerCase() !== trim.value.toLowerCase())
                            : [...selectedTrimTokens, trim.value]
                        );
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition",
                        selected
                          ? "border-primary bg-brand-tint text-primary"
                          : "border-[#d9d9d9] bg-white text-[#4b5565] hover:border-primary"
                      )}
                    >
                      {trim.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      );
    }

    if (field.key === "variant") {
      return (
        <>
          <SearchableSelect
            value={draft.details.variant}
            onChange={(value) => updateDetailField("variant", value)}
            options={referenceOptions.variants.map((variant) => ({ value: variant, label: variant }))}
            allowCustomValue
            placeholder="Select variant"
            searchPlaceholder="Search or type a variant"
            aria-label={field.label}
            className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
          />
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
      const showPalette = colorPaletteOpen || isCustomColor;
      const customSwatch = EXTENDED_COLOR_PALETTE.find(
        (shade) => shade.name.toLowerCase() === draft.details.color.trim().toLowerCase()
      )?.swatch;

      return (
        <div className="space-y-3">
          <SearchableSelect
            value={showPalette ? OTHER_COLOR_VALUE : draft.details.color}
            onChange={(value) => {
              if (value === OTHER_COLOR_VALUE) {
                setColorPaletteOpen(true);
                if (isKnownColor) updateDetailField("color", "");
              } else {
                setColorPaletteOpen(false);
                updateDetailField("color", value);
              }
            }}
            options={COLOR_OPTIONS}
            placeholder="Select color"
            searchPlaceholder="Search color"
            aria-label={field.label}
            displayValue={
              isCustomColor ? (
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                    style={{
                      background:
                        customSwatch ??
                        "conic-gradient(from 90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)",
                    }}
                    aria-hidden
                  />
                  <span className="truncate">{draft.details.color}</span>
                </span>
              ) : undefined
            }
            className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
          />
          {showPalette ? (
            <div className="space-y-3 rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-3">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {EXTENDED_COLOR_PALETTE.map((shade) => {
                  const selected = draft.details.color === shade.name;
                  return (
                    <button
                      key={shade.name}
                      type="button"
                      title={shade.name}
                      aria-label={shade.name}
                      aria-pressed={selected}
                      onClick={() => updateDetailField("color", shade.name)}
                      className={cn(
                        "aspect-square w-full rounded-full border border-black/10 transition hover:scale-105",
                        selected && "ring-2 ring-primary ring-offset-2"
                      )}
                      style={{ background: shade.swatch }}
                    />
                  );
                })}
              </div>
              <input
                value={isKnownColor ? "" : draft.details.color}
                onChange={(event) => updateDetailField("color", event.target.value)}
                placeholder="Or type the exact color name, e.g. Metallic Grey"
                className={cn(sellerInputClass, hasError && "border-[#f04438]")}
              />
            </div>
          ) : null}
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
          Select a category above to load the correct specification fields.
        </div>
      ) : null}

      {isCarCategory ? (
        <div className="rounded-[12px] border border-brand-muted-border bg-brand-soft-surface px-4 py-3 text-[12px] leading-5 text-primary">
          Details use a structured vehicle catalog: make leads to model, then trim and
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
                  <SearchableSelect
                    value={draft.details[field.key]}
                    onChange={(value) => updateDetailField(field.key, value)}
                    options={field.options ?? []}
                    placeholder="Select"
                    searchPlaceholder={`Search ${field.label.toLowerCase()}`}
                    aria-label={field.label}
                    className={cn(sellerSelectClass, hasError && "border-[#f04438]")}
                  />
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
                {formatDetailSummaryValue(field, draft.details[field.key]) || "Not entered"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
