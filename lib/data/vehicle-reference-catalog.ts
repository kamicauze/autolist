import { CAR_MAKES_DATA } from "@/lib/constants/car-data";

export type VehicleTrimOption = {
  label: string;
  value: string;
  source: "shared" | "model";
};

export type VehicleReferenceOptions = {
  makes: string[];
  models: string[];
  trimOptions: VehicleTrimOption[];
  variants: string[];
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

  return {
    makes,
    models,
    trimOptions: model ? [...modelTrims, ...sharedTrims] : [],
    variants: sortValues(model?.variants ?? []),
  };
}
