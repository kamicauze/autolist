import type { ListingCategory } from "@/lib/constants/marketplace";
import { CAR_MAKES_DATA } from "@/lib/constants/car-data";
import { NON_CAR_REFERENCE_DATA } from "@/lib/constants/non-car-reference-data";
import { shapeVariantOptionsForMake } from "@/lib/utils/vehicle-variant-visibility";

export type VehicleTrimOption = {
  label: string;
  value: string;
  source: "shared" | "model";
};

export type VehicleReferenceInputMode = "select" | "manual";

export type VehicleReferenceOptions = {
  makes: string[];
  models: string[];
  trimOptions: VehicleTrimOption[];
  variants: string[];
  makeInputMode?: VehicleReferenceInputMode;
  modelInputMode?: VehicleReferenceInputMode;
  makeHelperText?: string | null;
  modelHelperText?: string | null;
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sortValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function getVehicleReferenceOptionsFallback(
  makeName?: string | null,
  modelName?: string | null
): VehicleReferenceOptions {
  const makes = sortValues(CAR_MAKES_DATA.map((make) => make.name));
  const make = makeName
    ? CAR_MAKES_DATA.find(
        (entry) => normalizeValue(entry.name) === normalizeValue(makeName)
      ) ?? null
    : null;

  if (!make) {
    return {
      makes,
      models: [],
      trimOptions: [],
      variants: [],
      makeInputMode: "select",
      modelInputMode: "select",
    };
  }

  const models = sortValues(make.models.map((model) => model.name));
  const model = modelName
    ? make.models.find(
        (entry) => normalizeValue(entry.name) === normalizeValue(modelName)
      ) ?? null
    : null;
  const modelTrims = sortValues(model?.trims ?? []).map((trim) => ({
    label: trim,
    value: trim,
    source: "model" as const,
  }));
  const sharedTrims = sortValues(make.trims ?? [])
    .filter((trim) => !modelTrims.some((option) => normalizeValue(option.value) === normalizeValue(trim)))
    .map((trim) => ({
      label: trim,
      value: trim,
      source: "shared" as const,
    }));

  const shapedReferenceOptions = shapeVariantOptionsForMake(
    make.name,
    [...modelTrims, ...sharedTrims],
    sortValues(model?.variants ?? [])
  );

  return {
    makes,
    models,
    trimOptions: model ? shapedReferenceOptions.trimOptions : [],
    variants: model ? shapedReferenceOptions.variants : [],
    makeInputMode: "select",
    modelInputMode: "select",
  };
}

export function getNonCarVehicleReferenceOptions(
  category?: ListingCategory | "" | null
): VehicleReferenceOptions {
  const reference = category ? NON_CAR_REFERENCE_DATA[category] : undefined;

  if (!reference) {
    return {
      makes: [],
      models: [],
      trimOptions: [],
      variants: [],
      makeInputMode: "manual",
      modelInputMode: "manual",
      makeHelperText: null,
      modelHelperText: null,
    };
  }

  return {
    makes: sortValues(reference.makes),
    models: [],
    trimOptions: [],
    variants: [],
    makeInputMode: reference.makes.length > 0 ? "select" : "manual",
    modelInputMode: reference.modelInputMode,
    makeHelperText: reference.makeHelperText,
    modelHelperText: reference.modelHelperText,
  };
}
