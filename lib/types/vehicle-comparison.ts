export type VehicleComparisonProvider = "openai" | "local_llm" | "rules";
export type VehicleComparisonResearchMode = "web" | "model" | "listing_only";

export type VehicleComparisonSource = {
  title: string;
  url: string;
};

export type VehicleResearchedSpecification = {
  label: string;
  value: string;
};

export type VehicleComparisonPick = {
  vehicleId: string;
  title: string;
  reason: string;
};

export type VehicleModelInsight = {
  vehicleId: string;
  title: string;
  modelSummary: string;
  buyerFit: string;
  knownConsiderations: string[];
  researchedSpecs: VehicleResearchedSpecification[];
};

export type VehicleComparisonResult = {
  headline: string;
  summary: string;
  bestFor: VehicleComparisonPick[];
  modelInsights: VehicleModelInsight[];
  modelComparisons: string[];
  tradeoffs: string[];
  watchouts: string[];
  provider: VehicleComparisonProvider;
  model: string | null;
  researchMode: VehicleComparisonResearchMode;
  sources: VehicleComparisonSource[];
};

export type VehicleResearchIdentity = {
  researchKey: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  variant: string | null;
  fuelType: string | null;
  transmission: string | null;
};

/** Sourced typical model-year research, reusable across listings with the same identity. */
export type CachedVehicleResearch = {
  modelSummary: string;
  buyerFit: string;
  knownConsiderations: string[];
  researchedSpecs: VehicleResearchedSpecification[];
  sources: VehicleComparisonSource[];
  model: string | null;
};

export type VehicleResearchCache = {
  get(keys: string[]): Promise<Map<string, CachedVehicleResearch>>;
  put(entries: Array<{ identity: VehicleResearchIdentity; research: CachedVehicleResearch }>): Promise<void>;
};
