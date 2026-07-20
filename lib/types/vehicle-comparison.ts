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
