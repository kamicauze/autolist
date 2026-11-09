import { createOptionalAdminClient } from "@/lib/supabase/admin";
import type {
  CachedVehicleResearch,
  VehicleComparisonSource,
  VehicleResearchCache,
  VehicleResearchedSpecification,
} from "@/lib/types/vehicle-comparison";

const TABLE = "vehicle_model_research";
const RESEARCH_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type ResearchRow = {
  research_key: string;
  model_summary: string;
  buyer_fit: string;
  known_considerations: unknown;
  researched_specs: unknown;
  sources: unknown;
  research_model: string | null;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

function specArray(value: unknown): VehicleResearchedSpecification[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is VehicleResearchedSpecification =>
      typeof item?.label === "string" && typeof item?.value === "string"
  );
}

function sourceArray(value: unknown): VehicleComparisonSource[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is VehicleComparisonSource =>
      typeof item?.title === "string" && typeof item?.url === "string" && /^https?:\/\//.test(item.url)
  );
}

/**
 * Service-role cache for sourced model-year research (ADR-0008). Returns
 * undefined without service-role configuration; read/write failures degrade to
 * a cache miss so the comparison still runs.
 */
export function createVehicleResearchCache(): VehicleResearchCache | undefined {
  const client = createOptionalAdminClient();
  if (!client) return undefined;

  return {
    async get(keys) {
      const results = new Map<string, CachedVehicleResearch>();
      if (keys.length === 0) return results;

      const { data, error } = await client
        .from(TABLE)
        .select("research_key, model_summary, buyer_fit, known_considerations, researched_specs, sources, research_model")
        .in("research_key", keys)
        .gt("expires_at", new Date().toISOString());

      if (error) {
        console.warn("Vehicle research cache read failed:", error.message);
        return results;
      }

      for (const row of (data || []) as ResearchRow[]) {
        const sources = sourceArray(row.sources);
        if (sources.length === 0 || !row.model_summary || !row.buyer_fit) continue;
        results.set(row.research_key, {
          modelSummary: row.model_summary,
          buyerFit: row.buyer_fit,
          knownConsiderations: stringArray(row.known_considerations),
          researchedSpecs: specArray(row.researched_specs),
          sources,
          model: row.research_model,
        });
      }

      return results;
    },

    async put(entries) {
      if (entries.length === 0) return;
      const researchedAt = new Date();
      const expiresAt = new Date(researchedAt.getTime() + RESEARCH_TTL_MS);

      const { error } = await client.from(TABLE).upsert(
        entries.map(({ identity, research }) => ({
          research_key: identity.researchKey,
          make: identity.make,
          model: identity.model,
          year: identity.year,
          vehicle_trim: identity.trim,
          variant: identity.variant,
          fuel_type: identity.fuelType,
          transmission: identity.transmission,
          model_summary: research.modelSummary,
          buyer_fit: research.buyerFit,
          known_considerations: research.knownConsiderations,
          researched_specs: research.researchedSpecs,
          sources: research.sources,
          research_model: research.model,
          researched_at: researchedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })),
        { onConflict: "research_key" }
      );

      if (error) console.warn("Vehicle research cache write failed:", error.message);
    },
  };
}
