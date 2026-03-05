"use server";

import {
  getModelsForMakeName,
  getTrimsForMakeName,
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

/**
 * Server action: fetch trim names for a given make.
 */
export async function fetchTrimsForMake(
  makeName: string
): Promise<string[]> {
  if (!makeName || makeName === "any") return [];
  return getTrimsForMakeName(makeName);
}
