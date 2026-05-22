type VehicleTrimLike = {
  label: string;
  value: string;
  source: "shared" | "model";
};

const COMPLEX_VARIANT_MAKES = new Set([
  "mercedes",
  "mercedes-benz",
  "mercedes benz",
  "bmw",
  "porsche",
  "audi",
  "land rover",
  "range rover",
  "volvo",
  "jaguar",
  "lexus",
]);

function normalizeVehicleValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isComplexVariantMake(make: string) {
  const normalized = normalizeVehicleValue(make);
  if (!normalized) return false;
  return COMPLEX_VARIANT_MAKES.has(normalized);
}

export function shapeVariantOptionsForMake<TTrim extends VehicleTrimLike>(
  makeName: string | null | undefined,
  trimOptions: TTrim[],
  variants: string[]
) {
  if (isComplexVariantMake(makeName ?? "")) {
    return { trimOptions, variants };
  }

  const existingTrimValues = new Set(
    trimOptions.map((trim) => normalizeVehicleValue(trim.value))
  );
  const variantTrimOptions = variants
    .filter((variant) => {
      const normalized = normalizeVehicleValue(variant);
      return normalized && !existingTrimValues.has(normalized);
    })
    .map((variant) => ({
      label: variant,
      value: variant,
      source: "model" as const,
    }));

  return {
    trimOptions: [...trimOptions, ...variantTrimOptions],
    variants: [],
  };
}
