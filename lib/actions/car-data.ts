"use server";

import {
  getModelsForMakeName,
  getVehicleReferenceOptions,
} from "@/lib/data/car-data";

/**
 * Server action: fetch model names for a given make.
 * Called from client components (hero-search, quick-filter-bar, etc.).
 */
export async function fetchModelsForMake(
  makeName: string
): Promise<string[]> {
  if (!makeName || makeName === "any") return [];
  return getModelsForMakeName(makeName);
}

export async function fetchVehicleReferenceOptionsAction(
  makeName?: string,
  modelName?: string
) {
  return getVehicleReferenceOptions(makeName, modelName);
}
