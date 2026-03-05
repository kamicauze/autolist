import { createClient } from "@/lib/supabase/server";
import type { CarMake } from "@/lib/types/car-data";

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
 * Returns trim names for a given make (by name, case-insensitive).
 */
export async function getTrimsForMakeName(
  makeName: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data: make } = await supabase
    .from("car_makes")
    .select("id")
    .ilike("name", makeName)
    .single();

  if (!make) return [];

  const { data: trims, error } = await supabase
    .from("car_trims")
    .select("name")
    .eq("make_id", make.id)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("getTrimsForMakeName error:", error.message);
    return [];
  }

  return trims.map((t) => t.name);
}

/**
 * Returns variant names for a model (by make name + model name).
 */
export async function getVariantsForModelName(
  makeName: string,
  modelName: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data: make } = await supabase
    .from("car_makes")
    .select("id")
    .ilike("name", makeName)
    .single();

  if (!make) return [];

  const { data: model } = await supabase
    .from("car_models")
    .select("id")
    .eq("make_id", make.id)
    .ilike("name", modelName)
    .single();

  if (!model) return [];

  const { data: variants, error } = await supabase
    .from("car_variants")
    .select("name")
    .eq("model_id", model.id)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("getVariantsForModelName error:", error.message);
    return [];
  }

  return variants.map((v) => v.name);
}
