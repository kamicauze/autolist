import { createClient } from "@/lib/supabase/server";
import type { CarMake } from "@/lib/types/car-data";
import {
  getVehicleReferenceOptionsFallback,
  type VehicleReferenceOptions,
} from "@/lib/data/vehicle-reference-catalog";

// ── Server-side fetchers for car reference data ─────────────────────────────
// These tables are small (~57 makes, ~850 models) so direct queries are fast.
// Next.js request-level deduplication prevents redundant calls in the same render.

/**
 * Returns all make names sorted alphabetically.
 * Used by server components to pass to client dropdowns.
 */
export async function getAllMakeNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_makes")
    .select("name")
    .order("name");

  if (error) {
    console.error("getAllMakeNames error:", error.message);
    return [];
  }

  return data.map((m) => m.name);
}

/**
 * Returns popular makes (is_popular = true) sorted by sort_order then name.
 */
export async function getPopularMakes(): Promise<CarMake[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_makes")
    .select("*")
    .eq("is_popular", true)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("getPopularMakes error:", error.message);
    return [];
  }

  return data as CarMake[];
}

/**
 * Returns model names for a given make (by name, case-insensitive).
 */
export async function getModelsForMakeName(
  makeName: string
): Promise<string[]> {
  const supabase = await createClient();

  // Look up make ID
  const { data: make } = await supabase
    .from("car_makes")
    .select("id")
    .ilike("name", makeName)
    .single();

  if (!make) return [];

  const { data: models, error } = await supabase
    .from("car_models")
    .select("name")
    .eq("make_id", make.id)
    .order("name");

  if (error) {
    console.error("getModelsForMakeName error:", error.message);
    return [];
  }

  return models.map((m) => m.name);
}

/**
 * Returns the full vehicle reference chain for a given make/model selection.
 */
export async function getVehicleReferenceOptions(
  makeName?: string | null,
  modelName?: string | null
): Promise<VehicleReferenceOptions> {
  const supabase = await createClient();
  const { data: makes, error: makesError } = await supabase
    .from("car_makes")
    .select("id, name")
    .order("name");

  if (makesError) {
    console.error("getVehicleReferenceOptions makes error:", makesError.message);
    return getVehicleReferenceOptionsFallback(makeName, modelName);
  }

  const makeOptions = makes.map((make) => make.name);
  const selectedMakeName = makeName?.trim();

  if (!selectedMakeName) {
    return {
      makes: makeOptions,
      models: [],
      trimOptions: [],
      variants: [],
    };
  }

  const { data: make } = await supabase
    .from("car_makes")
    .select("id")
    .ilike("name", selectedMakeName)
    .single();

  if (!make) {
    return {
      makes: makeOptions,
      models: [],
      trimOptions: [],
      variants: [],
    };
  }

  const { data: models, error: modelsError } = await supabase
    .from("car_models")
    .select("id, name")
    .eq("make_id", make.id)
    .order("name");

  if (modelsError) {
    console.error("getVehicleReferenceOptions models error:", modelsError.message);
    return getVehicleReferenceOptionsFallback(makeName, modelName);
  }

  const modelOptions = models.map((model) => model.name);
  const selectedModelName = modelName?.trim();

  if (!selectedModelName) {
    return {
      makes: makeOptions,
      models: modelOptions,
      trimOptions: [],
      variants: [],
    };
  }

  const selectedModel = models.find(
    (model) => model.name.toLowerCase() === selectedModelName.toLowerCase()
  );

  if (!selectedModel) {
    return {
      makes: makeOptions,
      models: modelOptions,
      trimOptions: [],
      variants: [],
    };
  }

  const { data: trims, error } = await supabase
    .from("car_trims")
    .select("name, is_shared")
    .eq("model_id", selectedModel.id)
    .order("is_shared", { ascending: true })
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("getVehicleReferenceOptions trims error:", error.message);
    return getVehicleReferenceOptionsFallback(makeName, modelName);
  }

  const { data: variants, error: variantsError } = await supabase
    .from("car_variants")
    .select("name")
    .eq("model_id", selectedModel.id)
    .order("sort_order")
    .order("name");

  if (variantsError) {
    console.error("getVehicleReferenceOptions variants error:", variantsError.message);
    return {
      makes: makeOptions,
      models: modelOptions,
      trimOptions: trims.map((trim) => ({
        label: trim.name,
        value: trim.name,
        source: trim.is_shared ? ("shared" as const) : ("model" as const),
      })),
      variants: [],
    };
  }

  return {
    makes: makeOptions,
    models: modelOptions,
    trimOptions: trims.map((trim) => ({
      label: trim.name,
      value: trim.name,
      source: trim.is_shared ? ("shared" as const) : ("model" as const),
    })),
    variants: variants.map((variant) => variant.name),
  };
}
